import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileText } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertStudent } from "@shared/schema";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const [csvData, setCsvData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const bulkUploadMutation = useMutation({
    mutationFn: async (students: InsertStudent[]) => {
      const promises = students.map(student => 
        apiRequest("POST", "/api/students", student).catch(error => ({ error, student }))
      );
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      const successCount = results.filter(result => !('error' in result)).length;
      const errorCount = results.length - successCount;
      
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Bulk Upload Complete",
        description: `${successCount} students added successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
      
      setCsvData("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process bulk upload",
        variant: "destructive",
      });
    },
  });

  const processCsvData = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = csvData.trim().split('\n');
      const students: InsertStudent[] = [];
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, studentId, email, studentClass, section] = line.split(',').map(field => field.trim().replace(/"/g, ''));
        
        if (name && studentId && studentClass && section) {
          students.push({
            name,
            studentId,
            email: email || undefined,
            class: studentClass,
            section,
            isActive: true,
          });
        }
      }
      
      if (students.length === 0) {
        toast({
          title: "Error",
          description: "No valid student records found in CSV data",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      bulkUploadMutation.mutate(students);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Student ID,Email,Class,Section\nJohn Doe,ST2024100,john.doe@email.com,10th Grade,A\nJane Smith,ST2024101,jane.smith@email.com,11th Grade,B";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student-template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setCsvData("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
          </div>
          
          <Textarea
            id="csv-data"
            placeholder="Paste CSV data here or use the format:&#10;Name,Student ID,Email,Class,Section&#10;John Doe,ST2024001,john@email.com,10th Grade,A&#10;Jane Smith,ST2024002,jane@email.com,11th Grade,B"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">CSV Format:</p>
                <p>Name, Student ID, Email, Class, Section</p>
                <p className="mt-2 text-xs">Email is optional. Class should be like "10th Grade", "11th Grade", etc. Section should be A, B, C, or D.</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={processCsvData}
              disabled={isProcessing || bulkUploadMutation.isPending || !csvData.trim()}
              className="flex-1 bg-primary text-white hover:bg-primary-dark flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>
                {isProcessing || bulkUploadMutation.isPending ? "Processing..." : "Upload Students"}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}