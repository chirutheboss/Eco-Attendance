import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          
          <main className="flex-1 overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <span className="material-icons">menu</span>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Club Attendance</h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-800">Club Coordinator</p>
                    <p className="text-xs text-gray-600">Management System</p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">CC</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="p-4 lg:p-6 overflow-y-auto h-full pb-20 lg:pb-4">
              <Router />
            </div>
          </main>
        </div>

        <MobileNav />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
