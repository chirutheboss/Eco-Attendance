import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddStudentModal from "@/components/modals/add-student-modal";
import EditStudentModal from "@/components/modals/edit-student-modal";
import GoogleSheetsModal from "@/components/modals/google-sheets-modal";
import type { Student } from "@shared/schema";
import { SECTIONS } from "@/lib/constants";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students", selectedSection],
    queryFn: async () => {
      const url = selectedSection ? `/api/students?section=${selectedSection}` : "/api/students";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiRequest("DELETE", `/api/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sections = Array.from(new Set(students.map(s => s.section))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Students Management</h3>
          <p className="text-gray-600">Add and manage club members</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>Import from Sheets</span>
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white hover:bg-primary-dark flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-material">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                Search Students
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, ID, or class..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-48">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Section
              </Label>
              <Select value={selectedSection || "all"} onValueChange={(value) => setSelectedSection(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="shadow-material">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-800">
              Student List ({filteredStudents.length} students)
            </h4>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No students found matching your criteria.</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 bg-primary text-white hover:bg-primary-dark"
              >
                Add First Student
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      Student Info
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      ID
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      Shift
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      Section
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const initials = student.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {initials}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              {student.email && (
                                <div className="text-sm text-gray-500">
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {student.studentId}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {student.shift || "Shift 1"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary bg-opacity-10 text-primary">
                            {student.section}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={student.isActive 
                              ? "bg-success bg-opacity-10 text-success" 
                              : "bg-gray-100 text-gray-600"
                            }
                          >
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-dark"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error hover:text-red-700"
                              onClick={() => deleteStudentMutation.mutate(student.id)}
                              disabled={deleteStudentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <EditStudentModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
      
      <GoogleSheetsModal 
        isOpen={isGoogleSheetsModalOpen} 
        onClose={() => setIsGoogleSheetsModalOpen(false)} 
      />
    </div>
  );
}
