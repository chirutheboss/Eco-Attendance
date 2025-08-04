import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Building2 } from "lucide-react";

interface QuickStatsProps {
  className?: string;
}

interface StatsData {
  totalStudents: string;
  presentToday: number;
  absentToday: number;
  totalSections: number;
}

export default function QuickStats({ className }: QuickStatsProps) {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000, // Update every 5 seconds
  });

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Enrolled members"
    },
    {
      title: "Present Today",
      value: stats?.presentToday || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Attended today"
    },
    {
      title: "Absent Today",
      value: stats?.absentToday || 0,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Missing today"
    },
    {
      title: "Sections",
      value: stats?.totalSections || 0,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Active sections"
    }
  ];

  // Remove attendance rate calculation as requested

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-material animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-material hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>


    </div>
  );
}