import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, UserCheck, UserX, Calendar } from "lucide-react";
import type { Student, Attendance } from "@shared/schema";

export default function RecentActivity() {
  // Get recent attendance records from the last 7 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: recentAttendance = [], isLoading } = useQuery<(Attendance & { student: Student })[]>({
    queryKey: ["/api/attendance/range", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/range/${startDate}/${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch recent attendance");
      return response.json();
    },
  });

  // Sort by date and time (most recent first) and take the last 10 records
  const sortedAttendance = recentAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sortedAttendance.length === 0) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent attendance records</p>
            <p className="text-sm text-gray-400 mt-1">Attendance records will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAttendance.map((record, index) => {
            const isPresent = record.isPresent;
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={`${record.studentId}-${record.date}`} className="flex items-center space-x-3 py-2">
                <div className={`p-2 rounded-full ${
                  isPresent ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {isPresent ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {record.student.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      {dayOfWeek}, {formattedDate}
                    </span>
                    <span>•</span>
                    <span>Section {record.student.section}</span>
                    <span>•</span>
                    <span>{record.student.class}</span>
                  </div>
                </div>
                
                <Badge 
                  variant={isPresent ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isPresent ? "Present" : "Absent"}
                </Badge>
              </div>
            );
          })}
        </div>
        
        {recentAttendance.length > 10 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Showing 10 most recent records of {recentAttendance.length} total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}