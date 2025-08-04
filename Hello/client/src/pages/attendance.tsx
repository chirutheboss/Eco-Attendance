import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Save, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AttendanceCalendar from "@/components/attendance/attendance-calendar";
import type { Student, Attendance } from "@shared/schema";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<Map<string, boolean>>(new Map());
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students", selectedSection],
    queryFn: async () => {
      const url = selectedSection ? `/api/students?section=${selectedSection}` : "/api/students";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const { data: existingAttendance = [], isLoading: attendanceLoading } = useQuery<(Attendance & { student: Student })[]>({
    queryKey: ["/api/attendance", selectedDate, selectedSection],
    queryFn: async () => {
      const url = selectedSection 
        ? `/api/attendance/${selectedDate}?section=${selectedSection}`
        : `/api/attendance/${selectedDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch attendance");
      }
      return response.json();
    },
    enabled: !!selectedDate,
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: Array<{ studentId: string; date: string; isPresent: boolean }>) => {
      await apiRequest("POST", "/api/attendance/bulk", { attendanceRecords });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    },
  });

  // Initialize attendance data from existing records
  React.useEffect(() => {
    const newAttendanceData = new Map();
    existingAttendance.forEach(record => {
      newAttendanceData.set(record.studentId, record.isPresent);
    });
    setAttendanceData(newAttendanceData);
  }, [existingAttendance]);

  const sections = Array.from(new Set(students.map(s => s.section))).sort();
  
  const presentCount = Array.from(attendanceData.values()).filter(present => present).length;
  const absentCount = Array.from(attendanceData.values()).filter(present => !present).length;
  const notMarkedCount = students.length - attendanceData.size;

  const markAttendance = (studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => new Map(prev.set(studentId, isPresent)));
    
    // Add gentle feedback animation
    const button = document.querySelector(`[data-student-id="${studentId}"][data-status="${isPresent ? 'present' : 'absent'}"]`);
    if (button) {
      button.classList.add('animate-click');
      setTimeout(() => button.classList.remove('animate-click'), 150);
    }
  };

  const markAllPresent = () => {
    const newData = new Map();
    students.forEach(student => {
      newData.set(student.id, true);
    });
    setAttendanceData(newData);
  };

  const markAllAbsent = () => {
    const newData = new Map();
    students.forEach(student => {
      newData.set(student.id, false);
    });
    setAttendanceData(newData);
  };

  const saveAttendance = () => {
    const attendanceRecords = Array.from(attendanceData.entries()).map(([studentId, isPresent]) => ({
      studentId,
      date: selectedDate,
      isPresent,
    }));

    if (attendanceRecords.length === 0) {
      toast({
        title: "No Data",
        description: "Please mark attendance for at least one student",
        variant: "destructive",
      });
      return;
    }

    saveAttendanceMutation.mutate(attendanceRecords);
  };

  const isLoading = studentsLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      {showCalendar && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AttendanceCalendar 
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Mark Attendance</h3>
          <p className="text-gray-600">Record student attendance for selected date</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowCalendar(!showCalendar)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            onClick={saveAttendance}
            disabled={saveAttendanceMutation.isPending || attendanceData.size === 0}
            className="bg-success text-white hover:bg-green-600 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Attendance</span>
          </Button>
        </div>
      </div>

      {/* Section Filter and Stats */}
      <Card className="shadow-material">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="lg:w-64">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Section
              </Label>
              <Select value={selectedSection || "all"} onValueChange={(value) => setSelectedSection(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-gray-600">Present: <span className="font-medium">{presentCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-error rounded-full"></div>
                <span className="text-gray-600">Absent: <span className="font-medium">{absentCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Not Marked: <span className="font-medium">{notMarkedCount}</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      <Card className="shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-gray-800">
              {selectedSection ? `Section ${selectedSection} Students` : "All Students"}
              ({students.length})
            </h4>
            <div className="flex space-x-2">
              <Button
                onClick={markAllPresent}
                disabled={isLoading}
                className="bg-success text-white hover:bg-green-600"
                size="sm"
              >
                Mark All Present
              </Button>
              <Button
                onClick={markAllAbsent}
                disabled={isLoading}
                className="bg-error text-white hover:bg-red-600"
                size="sm"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found for the selected criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {students.map((student) => {
                const initials = student.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const attendanceStatus = attendanceData.get(student.id);
                const isPresent = attendanceStatus === true;
                const isAbsent = attendanceStatus === false;

                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{initials}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{student.name}</h5>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                        <p className="text-xs text-gray-500">{student.shift} - {student.section}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => markAttendance(student.id, true)}
                        data-student-id={student.id}
                        data-status="present"
                        className={`flex-1 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 ${
                          isPresent
                            ? "bg-success text-white hover:bg-green-600 shadow-lg scale-105"
                            : "border border-success text-success hover:bg-success hover:text-white hover:shadow-md"
                        }`}
                        size="sm"
                      >
                        <Check className={`h-4 w-4 transition-transform duration-200 ${isPresent ? 'scale-110' : ''}`} />
                        <span>Present</span>
                      </Button>
                      <Button
                        onClick={() => markAttendance(student.id, false)}
                        data-student-id={student.id}
                        data-status="absent"
                        className={`flex-1 flex items-center justify-center space-x-1 transition-all duration-300 transform hover:scale-105 ${
                          isAbsent
                            ? "bg-error text-white hover:bg-red-600 shadow-lg scale-105"
                            : "border border-error text-error hover:bg-error hover:text-white hover:shadow-md"
                        }`}
                        size="sm"
                      >
                        <X className={`h-4 w-4 transition-transform duration-200 ${isAbsent ? 'scale-110' : ''}`} />
                        <span>Absent</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
