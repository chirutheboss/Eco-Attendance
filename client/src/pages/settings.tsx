import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Database, Download, Users, Shield, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly",
    });
  };

  const settingSections = [
    {
      title: "General Settings",
      icon: SettingsIcon,
      settings: [
        {
          id: "notifications",
          label: "Enable Notifications",
          description: "Receive alerts for attendance updates",
          type: "switch" as const,
          value: notifications,
          onChange: setNotifications
        },
        {
          id: "language",
          label: "Language",
          description: "Choose your preferred language",
          type: "select" as const,
          value: language,
          onChange: setLanguage,
          options: [
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "fr", label: "Français" }
          ]
        }
      ]
    },
    {
      title: "Appearance",
      icon: Palette,
      settings: [
        {
          id: "theme",
          label: "Theme",
          description: "Choose your preferred color scheme",
          type: "select" as const,
          value: theme,
          onChange: setTheme,
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" }
          ]
        }
      ]
    },
    {
      title: "Data Management",
      icon: Database,
      settings: [
        {
          id: "autoBackup",
          label: "Automatic Backup",
          description: "Automatically backup data daily",
          type: "switch" as const,
          value: autoBackup,
          onChange: setAutoBackup
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Settings</h3>
          <p className="text-gray-600">Manage your preferences and system configuration</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          Save Changes
        </Button>
      </div>

      {/* System Status */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Database</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">API Status</p>
                <p className="text-xs text-blue-600">Operational</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-800">Last Backup</p>
                <p className="text-xs text-purple-600">2 hours ago</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Recent</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {settingSections.map((section, index) => {
        const Icon = section.icon;
        return (
          <Card key={index} className="shadow-material">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={setting.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                    
                    <div className="w-48">
                      {setting.type === "switch" && (
                        <Switch
                          id={setting.id}
                          checked={setting.value as boolean}
                          onCheckedChange={setting.onChange as (checked: boolean) => void}
                        />
                      )}
                      
                      {setting.type === "select" && (
                        <Select 
                          value={setting.value as string} 
                          onValueChange={setting.onChange as (value: string) => void}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {setting.type === "input" && (
                        <Input
                          id={setting.id}
                          value={setting.value as string}
                          onChange={(e) => (setting.onChange as (value: string) => void)(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                  
                  {settingIndex < section.settings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Data Export */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export your data in various formats for backup or transfer purposes.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Students (CSV)</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Attendance (Excel)</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Full Backup (JSON)</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Version</Label>
              <p className="text-gray-600">1.0.0</p>
            </div>
            <div>
              <Label className="font-medium">Database</Label>
              <p className="text-gray-600">PostgreSQL</p>
            </div>
            <div>
              <Label className="font-medium">Last Updated</Label>
              <p className="text-gray-600">August 3, 2025</p>
            </div>
            <div>
              <Label className="font-medium">Support</Label>
              <p className="text-gray-600">contact@clubmanagement.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}