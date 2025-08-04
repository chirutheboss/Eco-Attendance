import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, UserPlus, Download, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Mark Attendance",
      description: "Record today's attendance",
      icon: Calendar,
      href: "/attendance",
      color: "bg-primary text-white hover:bg-primary-dark",
      iconBg: "bg-white bg-opacity-20"
    },
    {
      title: "Add Student",
      description: "Register new member",
      icon: UserPlus,
      href: "/students",
      color: "bg-secondary text-white hover:bg-secondary-dark",
      iconBg: "bg-white bg-opacity-20"
    },
    {
      title: "View Reports",
      description: "Check attendance analytics",
      icon: BarChart3,
      href: "/reports",
      color: "bg-success text-white hover:bg-green-600",
      iconBg: "bg-white bg-opacity-20"
    },
    {
      title: "Export Data",
      description: "Download Excel report",
      icon: Download,
      href: "/reports",
      color: "bg-purple-600 text-white hover:bg-purple-700",
      iconBg: "bg-white bg-opacity-20"
    }
  ];

  const quickLinks = [
    {
      title: "All Students",
      description: "Manage member records",
      icon: Users,
      href: "/students",
      count: null
    },
    {
      title: "Today's Records",
      description: "View today's attendance",
      icon: FileText,
      href: "/attendance",
      count: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Button 
                    className={`w-full h-auto p-4 flex flex-col items-center space-y-3 ${action.color} transition-all duration-200 hover:scale-105`}
                    size="lg"
                  >
                    <div className={`p-3 rounded-full ${action.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Links */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{link.title}</p>
                        <p className="text-sm text-gray-500">{link.description}</p>
                      </div>
                    </div>
                    {link.count && (
                      <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {link.count}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}