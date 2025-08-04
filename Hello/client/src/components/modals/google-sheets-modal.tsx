import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSheetsModal({ isOpen, onClose }: GoogleSheetsModalProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const importStudentsMutation = useMutation({
    mutationFn: async (url: string) => {
      setIsValidating(true);
      
      // Extract sheet ID from Google Sheets URL
      const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error("Invalid Google Sheets URL");
      }
      
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      try {
        // Fetch CSV data from Google Sheets
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error("Unable to access the Google Sheet. Please ensure it's publicly viewable.");
        }
        
        const csvText = await response.text();
        
        // Parse CSV data
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error("Sheet must contain at least a header row and one data row");
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const students = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length < headers.length) continue;
          
          const student: any = {};
          headers.forEach((header, index) => {
            student[header] = values[index] || '';
          });
          
          // Map common column names to our schema
          const mappedStudent = {
            name: student.name || student.fullname || student['student name'] || '',
            studentId: student.studentid || student['student id'] || student.id || '',
            email: student.email || student['email address'] || '',
            section: student.section || '',
            shift: student.shift || "Shift 1",
            isActive: true
          };
          
          // Validate required fields
          if (!mappedStudent.name || !mappedStudent.studentId || !mappedStudent.section) {
            continue; // Skip invalid rows
          }
          
          students.push(mappedStudent);
        }
        
        if (students.length === 0) {
          throw new Error("No valid student records found. Please check your data format.");
        }
        
        // Import students via API
        await apiRequest("POST", "/api/students/bulk", { students });
        
        return students.length;
      } finally {
        setIsValidating(false);
      }
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `Successfully imported ${count} students from Google Sheets`,
      });
      handleClose();
    },
    onError: (error: Error) => {
      setIsValidating(false);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSheetUrl("");
    onClose();
  };

  const handleImport = () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }
    
    importStudentsMutation.mutate(sheetUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Import from Google Sheets</span>
          </DialogTitle>
          <DialogDescription>
            Import student data directly from a Google Sheets document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="sheetUrl">Google Sheets URL *</Label>
            <Input
              id="sheetUrl"
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Make sure your Google Sheet is publicly viewable (anyone with the link can view).
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              Required Sheet Format
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Column headers (first row):</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code>Name</code> - Student's full name</li>
                <li><code>StudentId</code> - Student ID (format: 24SJCCC + digits)</li>
                <li><code>Email</code> - Student's email address</li>
                <li><code>Section</code> - Student's section (BBA A, B.COM B, etc.)</li>
                <li><code>Shift</code> - Student shift (optional, defaults to "Shift 1")</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> The import will skip any rows with missing required fields (Name, StudentId, Section).
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={importStudentsMutation.isPending || isValidating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            className="flex-1 bg-primary text-white hover:bg-primary-dark"
            disabled={importStudentsMutation.isPending || isValidating || !sheetUrl.trim()}
          >
            {importStudentsMutation.isPending || isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isValidating ? "Validating..." : "Importing..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Students
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}