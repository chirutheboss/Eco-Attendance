import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, CheckCircle, XCircle } from "lucide-react";
import type { Student, Attendance } from "@shared/schema";

interface AttendanceCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export default function AttendanceCalendar({ onDateSelect, selectedDate }: AttendanceCalendarProps) {
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(selectedDate));

  // Get attendance data for the current month
  const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: monthlyAttendance = [] } = useQuery<(Attendance & { student: Student })[]>({
    queryKey: ["/api/attendance/range", startOfMonth, endOfMonth],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/range/${startOfMonth}/${endOfMonth}`);
      if (!response.ok) throw new Error("Failed to fetch attendance data");
      return response.json();
    },
  });

  // Group attendance by date
  const attendanceByDate = monthlyAttendance.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = { present: 0, absent: 0, total: 0 };
    }
    acc[record.date].total++;
    if (record.isPresent) {
      acc[record.date].present++;
    } else {
      acc[record.date].absent++;
    }
    return acc;
  }, {} as Record<string, { present: number; absent: number; total: number }>);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      onDateSelect(dateString);
    }
  };

  const modifiers = {
    hasAttendance: Object.keys(attendanceByDate).map(date => new Date(date)),
    selected: new Date(selectedDate),
  };

  const modifiersStyles = {
    hasAttendance: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'white',
      borderRadius: '50%',
    },
    selected: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'white',
      fontWeight: 'bold',
    },
  };

  const selectedDateStats = attendanceByDate[selectedDate];

  return (
    <div className="space-y-4">
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Attendance Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={new Date(selectedDate)}
            onSelect={handleDateSelect}
            month={calendarDate}
            onMonthChange={setCalendarDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDateStats && (
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle className="text-sm">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Total Records</span>
              </div>
              <Badge variant="secondary">{selectedDateStats.total}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <Badge className="bg-success bg-opacity-10 text-success">
                {selectedDateStats.present}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-error" />
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <Badge className="bg-error bg-opacity-10 text-error">
                {selectedDateStats.absent}
              </Badge>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                <span className="text-sm font-semibold text-primary">
                  {((selectedDateStats.present / selectedDateStats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}