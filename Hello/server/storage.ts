import { students, attendance, type Student, type InsertStudent, type Attendance, type InsertAttendance } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  getAllStudents(): Promise<Student[]>;
  getStudentsBySection(section: string): Promise<Student[]>;
  
  // Attendance operations
  markAttendance(attendanceRecord: InsertAttendance): Promise<Attendance>;
  getAttendanceByDate(date: string): Promise<(Attendance & { student: Student })[]>;
  getAttendanceByDateAndSection(date: string, section: string): Promise<(Attendance & { student: Student })[]>;
  getAttendanceByStudentAndDateRange(studentId: string, startDate: string, endDate: string): Promise<Attendance[]>;
  getAttendanceByDateRange(startDate: string, endDate: string): Promise<(Attendance & { student: Student })[]>;
  updateAttendance(studentId: string, date: string, isPresent: boolean): Promise<Attendance | undefined>;
  
  // Statistics
  getAttendanceStats(): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    totalSections: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      // First delete all attendance records for this student
      await db.delete(attendance).where(eq(attendance.studentId, id));
      
      // Then delete the student
      const result = await db.delete(students).where(eq(students.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error in deleteStudent:", error);
      throw error;
    }
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.isActive, true)).orderBy(asc(students.name));
  }

  async getStudentsBySection(section: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.section, section), eq(students.isActive, true)))
      .orderBy(asc(students.name));
  }

  async markAttendance(attendanceRecord: InsertAttendance): Promise<Attendance> {
    // Check if attendance already exists for this student and date
    const [existing] = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.studentId, attendanceRecord.studentId),
        eq(attendance.date, attendanceRecord.date)
      ));

    if (existing) {
      // Update existing attendance
      const [updated] = await db
        .update(attendance)
        .set({ isPresent: attendanceRecord.isPresent })
        .where(and(
          eq(attendance.studentId, attendanceRecord.studentId),
          eq(attendance.date, attendanceRecord.date)
        ))
        .returning();
      return updated;
    } else {
      // Insert new attendance record
      const [newRecord] = await db
        .insert(attendance)
        .values(attendanceRecord)
        .returning();
      return newRecord;
    }
  }

  async getAttendanceByDate(date: string): Promise<(Attendance & { student: Student })[]> {
    return await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        date: attendance.date,
        isPresent: attendance.isPresent,
        createdAt: attendance.createdAt,
        student: students,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .where(eq(attendance.date, date))
      .orderBy(asc(students.name));
  }

  async getAttendanceByDateAndSection(date: string, section: string): Promise<(Attendance & { student: Student })[]> {
    return await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        date: attendance.date,
        isPresent: attendance.isPresent,
        createdAt: attendance.createdAt,
        student: students,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .where(and(eq(attendance.date, date), eq(students.section, section)))
      .orderBy(asc(students.name));
  }

  async getAttendanceByStudentAndDateRange(studentId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.studentId, studentId),
        sql`${attendance.date} >= ${startDate}`,
        sql`${attendance.date} <= ${endDate}`
      ))
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByDateRange(startDate: string, endDate: string): Promise<(Attendance & { student: Student })[]> {
    return await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        date: attendance.date,
        isPresent: attendance.isPresent,
        createdAt: attendance.createdAt,
        student: students,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .where(and(
        sql`${attendance.date} >= ${startDate}`,
        sql`${attendance.date} <= ${endDate}`
      ))
      .orderBy(desc(attendance.date), asc(students.name));
  }

  async updateAttendance(studentId: string, date: string, isPresent: boolean): Promise<Attendance | undefined> {
    const [updated] = await db
      .update(attendance)
      .set({ isPresent })
      .where(and(
        eq(attendance.studentId, studentId),
        eq(attendance.date, date)
      ))
      .returning();
    return updated || undefined;
  }

  async getAttendanceStats(): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    totalSections: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get total active students
    const totalStudentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.isActive, true));
    
    // Get today's attendance stats
    const todayAttendanceResult = await db
      .select({
        isPresent: attendance.isPresent,
        count: sql<number>`count(*)`
      })
      .from(attendance)
      .where(eq(attendance.date, today))
      .groupBy(attendance.isPresent);
    
    // Get unique sections
    const sectionsResult = await db
      .selectDistinct({ section: students.section })
      .from(students)
      .where(eq(students.isActive, true));

    const totalStudents = totalStudentsResult[0]?.count || 0;
    const presentToday = todayAttendanceResult.find(r => r.isPresent)?.count || 0;
    const absentToday = todayAttendanceResult.find(r => !r.isPresent)?.count || 0;
    const totalSections = sectionsResult.length;

    return {
      totalStudents,
      presentToday,
      absentToday,
      totalSections,
    };
  }
}

export const storage = new DatabaseStorage();
