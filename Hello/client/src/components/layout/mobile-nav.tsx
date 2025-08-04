import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Users, BarChart3, CheckSquare, LayoutDashboard } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    label: "Students",
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: CheckSquare,
    label: "Attendance",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    label: "Reports",
  },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 transition-colors cursor-pointer",
                isActive ? "text-primary" : "text-gray-600"
              )}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
