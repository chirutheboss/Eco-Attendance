import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";
import * as XLSX from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  // Student routes
  app.get("/api/students", async (req, res) => {
    try {
      const { section } = req.query;
      const students = section 
        ? await storage.getStudentsBySection(section as string)
        : await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Check if student ID already exists
      const existingStudent = await storage.getStudentByStudentId(validatedData.studentId);
      if (existingStudent) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
      
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStudentSchema.partial().parse(req.body);
      
      const student = await storage.updateStudent(id, validatedData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Failed to update student" });
      }
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Bulk student import endpoint
  app.post("/api/students/bulk", async (req, res) => {
    try {
      const { students: studentsData } = req.body;
      
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({ message: "Invalid or empty students data" });
      }
      
      const results = [];
      const errors = [];
      
      for (let i = 0; i < studentsData.length; i++) {
        try {
          const validatedData = insertStudentSchema.parse(studentsData[i]);
          
          // Check if student ID already exists
          const existingStudent = await storage.getStudentByStudentId(validatedData.studentId);
          if (existingStudent) {
            errors.push(`Row ${i + 1}: Student ID ${validatedData.studentId} already exists`);
            continue;
          }
          
          const student = await storage.createStudent(validatedData);
          results.push(student);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(`Row ${i + 1}: ${error.errors.map(e => e.message).join(', ')}`);
          } else {
            errors.push(`Row ${i + 1}: Failed to create student`);
          }
        }
      }
      
      res.json({ 
        created: results.length,
        errors: errors,
        students: results
      });
    } catch (error) {
      console.error("Error in bulk student import:", error);
      res.status(500).json({ message: "Failed to import students" });
    }
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(validatedData);
      res.json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Failed to mark attendance" });
      }
    }
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const { attendanceRecords } = req.body;
      const validatedRecords = z.array(insertAttendanceSchema).parse(attendanceRecords);
      
      const results = [];
      for (const record of validatedRecords) {
        const attendance = await storage.markAttendance(record);
        results.push(attendance);
      }
      
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Error marking bulk attendance:", error);
        res.status(500).json({ message: "Failed to mark bulk attendance" });
      }
    }
  });

  app.get("/api/attendance/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const { section } = req.query;
      
      const attendance = section 
        ? await storage.getAttendanceByDateAndSection(date, section as string)
        : await storage.getAttendanceByDate(date);
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/range/:startDate/:endDate", async (req, res) => {
    try {
      const { startDate, endDate } = req.params;
      const attendance = await storage.getAttendanceByDateRange(startDate, endDate);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance range:", error);
      res.status(500).json({ message: "Failed to fetch attendance range" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getAttendanceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Excel export route
  app.get("/api/export/excel", async (req, res) => {
    try {
      const { startDate, endDate, section } = req.query;
      
      let attendance;
      if (startDate && endDate) {
        attendance = await storage.getAttendanceByDateRange(startDate as string, endDate as string);
      } else {
        const today = new Date().toISOString().split('T')[0];
        attendance = await storage.getAttendanceByDate(today);
      }

      // Filter by section if provided
      if (section) {
        attendance = attendance.filter(record => record.student.section === section);
      }

      // Group attendance by student
      const studentAttendance = new Map();
      const dates = new Set<string>();

      attendance.forEach(record => {
        const studentId = record.student.id;
        dates.add(record.date);
        
        if (!studentAttendance.has(studentId)) {
          studentAttendance.set(studentId, {
            name: record.student.name,
            studentId: record.student.studentId,
            shift: record.student.shift,
            section: record.student.section,
            email: record.student.email,
            attendance: new Map()
          });
        }
        
        studentAttendance.get(studentId).attendance.set(record.date, record.isPresent ? 'Present' : 'Absent');
      });

      // Convert to Excel format
      const sortedDates = Array.from(dates).sort();
      const excelData = [];
      
      // Header row
      const headers = ['Name', 'Student ID', 'Shift', 'Section', 'Email', ...sortedDates, 'Total Present', 'Total Absent', 'Attendance %'];
      excelData.push(headers);

      // Data rows
      studentAttendance.forEach((student) => {
        const row = [
          student.name,
          student.studentId,
          student.shift,
          student.section,
          student.email || ''
        ];
        
        let totalPresent = 0;
        let totalDays = 0;
        
        sortedDates.forEach(date => {
          const status = student.attendance.get(date) || 'Not Marked';
          row.push(status);
          if (status === 'Present') totalPresent++;
          if (status !== 'Not Marked') totalDays++;
        });
        
        const totalAbsent = totalDays - totalPresent;
        const attendancePercentage = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) + '%' : '0%';
        
        row.push(totalPresent, totalAbsent, attendancePercentage);
        excelData.push(row);
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
      
      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      res.status(500).json({ message: "Failed to export to Excel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
