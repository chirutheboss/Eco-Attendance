import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, Calendar, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceChart from "@/components/reports/attendance-chart";
import type { Student, Attendance } from "@shared/schema";

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const { toast } = useToast();

  const { data: attendanceData = [], isLoading } = useQuery<(Attendance & { student: Student })[]>({
    queryKey: ["/api/attendance/range", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/range/${startDate}/${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch attendance data");
      return response.json();
    },
    enabled: !!startDate && !!endDate,
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Calculate report statistics
  const calculateStats = () => {
    const filteredData = selectedSection 
      ? attendanceData.filter(record => record.student.section === selectedSection)
      : attendanceData;

    const totalRecords = filteredData.length;
    const presentRecords = filteredData.filter(record => record.isPresent).length;
    const overallAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
    const uniqueDates = new Set(filteredData.map(record => record.date));
    const daysRecorded = uniqueDates.size;

    return {
      overallAttendance: overallAttendance.toFixed(1),
      daysRecorded,
      totalRecords,
    };
  };

  // Calculate section-wise statistics
  const calculateSectionStats = () => {
    const sections = Array.from(new Set(students.map(s => s.section))).sort();
    
    return sections.map(section => {
      const sectionStudents = students.filter(s => s.section === section);
      const sectionAttendance = attendanceData.filter(record => record.student.section === section);
      
      const totalPresent = sectionAttendance.filter(record => record.isPresent).length;
      const totalAbsent = sectionAttendance.filter(record => !record.isPresent).length;
      const attendancePercentage = sectionAttendance.length > 0 
        ? (totalPresent / sectionAttendance.length) * 100 
        : 0;

      return {
        section,
        totalStudents: sectionStudents.length,
        totalPresent,
        totalAbsent,
        attendancePercentage: attendancePercentage.toFixed(1),
      };
    });
  };

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(selectedSection && { section: selectedSection })
      });

      const response = await fetch(`/api/export/excel?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance-report-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Excel report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export Excel report",
        variant: "destructive",
      });
    }
  };

  const stats = calculateStats();
  const sectionStats = calculateSectionStats();
  const sections = Array.from(new Set(students.map(s => s.section))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Attendance Reports</h3>
          <p className="text-gray-600">View analytics and export data</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            className="bg-secondary text-white hover:bg-secondary-dark flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Analytics</span>
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Report Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Section
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
            <div className="flex items-end">
              <Button className="w-full bg-primary text-white hover:bg-primary-dark">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Overall Attendance</h4>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{stats.overallAttendance}%</div>
            <p className="text-sm text-gray-600">Average across selected criteria</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Days Recorded</h4>
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-2">{stats.daysRecorded}</div>
            <p className="text-sm text-gray-600">In selected date range</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Total Records</h4>
              <FileText className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success mb-2">{stats.totalRecords}</div>
            <p className="text-sm text-gray-600">Attendance entries recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Charts */}
      <AttendanceChart 
        startDate={startDate}
        endDate={endDate}
        selectedSection={selectedSection}
      />

      {/* Section-wise Report */}
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-800 mb-6">Section-wise Attendance</h4>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : sectionStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance data found for the selected date range.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sectionStats.map((section) => (
                <div key={section.section} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-semibold">
                        Section {section.section}
                      </div>
                      <div className="text-sm text-gray-600">
                        {section.totalStudents} students
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary hover:text-secondary-dark"
                      onClick={() => {
                        setSelectedSection(section.section);
                        exportToExcel();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Present</p>
                      <p className="text-lg font-semibold text-success">{section.totalPresent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Absent</p>
                      <p className="text-lg font-semibold text-error">{section.totalAbsent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Attendance %</p>
                      <p className="text-lg font-semibold text-gray-900">{section.attendancePercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Progress</p>
                      <Progress 
                        value={parseFloat(section.attendancePercentage)} 
                        className="mt-1 h-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
