import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp } from "lucide-react";
import type { Student, Attendance } from "@shared/schema";

interface AttendanceChartProps {
  startDate: string;
  endDate: string;
  selectedSection?: string;
}

export default function AttendanceChart({ startDate, endDate, selectedSection }: AttendanceChartProps) {
  const { data: attendanceData = [] } = useQuery<(Attendance & { student: Student })[]>({
    queryKey: ["/api/attendance/range", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/range/${startDate}/${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch attendance data");
      return response.json();
    },
    enabled: !!startDate && !!endDate,
  });

  // Filter by section if selected
  const filteredData = selectedSection 
    ? attendanceData.filter(record => record.student.section === selectedSection)
    : attendanceData;

  // Group data by date for trend chart
  const dailyStats = filteredData.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { date, present: 0, absent: 0, total: 0 };
    }
    acc[date].total++;
    if (record.isPresent) {
      acc[date].present++;
    } else {
      acc[date].absent++;
    }
    return acc;
  }, {} as Record<string, { date: string; present: number; absent: number; total: number }>);

  const trendData = Object.values(dailyStats)
    .map(day => ({
      ...day,
      attendanceRate: day.total > 0 ? ((day.present / day.total) * 100) : 0,
      formattedDate: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group data by section for section comparison
  const sectionStats = filteredData.reduce((acc, record) => {
    const section = record.student.section;
    if (!acc[section]) {
      acc[section] = { section: `Section ${section}`, present: 0, absent: 0, total: 0 };
    }
    acc[section].total++;
    if (record.isPresent) {
      acc[section].present++;
    } else {
      acc[section].absent++;
    }
    return acc;
  }, {} as Record<string, { section: string; present: number; absent: number; total: number }>);

  const sectionData = Object.values(sectionStats).map(section => ({
    ...section,
    attendanceRate: section.total > 0 ? ((section.present / section.total) * 100) : 0,
  }));

  if (trendData.length === 0) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No attendance data available for the selected date range.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Trend Chart */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Attendance Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'attendanceRate' ? `${Number(value).toFixed(1)}%` : value,
                  name === 'attendanceRate' ? 'Attendance Rate' : 
                  name === 'present' ? 'Present' : 
                  name === 'absent' ? 'Absent' : 'Total'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="attendanceRate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="hsl(var(--error))" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section Comparison Chart */}
      {!selectedSection && sectionData.length > 1 && (
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Section-wise Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'attendanceRate' ? `${Number(value).toFixed(1)}%` : value,
                    name === 'attendanceRate' ? 'Attendance Rate' : 
                    name === 'present' ? 'Present' : 
                    name === 'absent' ? 'Absent' : 'Total'
                  ]}
                />
                <Bar dataKey="attendanceRate" fill="hsl(var(--primary))" />
                <Bar dataKey="present" fill="hsl(var(--success))" />
                <Bar dataKey="absent" fill="hsl(var(--error))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}