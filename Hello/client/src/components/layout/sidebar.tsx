import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Users, BarChart3, CheckSquare, LayoutDashboard, Settings } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
  },
  {
    name: "Mark Attendance",
    href: "/attendance",
    icon: CheckSquare,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-material hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Club Attendance</h1>
        <p className="text-sm text-gray-600">Management System</p>
      </div>
      
      <nav className="mt-6">
        <div className="space-y-1 px-6">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
