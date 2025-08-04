import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStudentSchema } from "@shared/schema";
import type { InsertStudent } from "@shared/schema";
import { SECTIONS, STUDENT_ID_PATTERN, STUDENT_ID_PREFIX, SHIFTS } from "@/lib/constants";
import { z } from "zod";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Updated form schema without class field and with proper student ID validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  studentId: z.string().regex(STUDENT_ID_PATTERN, "Student ID must be in format 24SJCCC### (e.g., 24SJCCC001)"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  section: z.string().min(1, "Section is required"),
  shift: z.string().default("Shift 1"),
  isActive: z.boolean().default(true),
});

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      studentId: STUDENT_ID_PREFIX,
      email: "",
      section: "",
      shift: "Shift 1",
      isActive: true,
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      form.reset({
        name: "",
        studentId: STUDENT_ID_PREFIX,
        email: "",
        section: "",
        shift: "Shift 1",
        isActive: true,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStudent) => {
    createStudentMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a new student to the club attendance system
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID *</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-2 rounded-l border">
                        {STUDENT_ID_PREFIX}
                      </span>
                      <Input 
                        placeholder="001" 
                        maxLength={3}
                        className="w-20"
                        {...field}
                        value={field.value.replace(STUDENT_ID_PREFIX, "")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                          field.onChange(STUDENT_ID_PREFIX + digits);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="student@email.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SECTIONS.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHIFTS.map((shift) => (
                        <SelectItem key={shift} value={shift}>
                          {shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-primary-dark"
                disabled={createStudentMutation.isPending}
              >
                {createStudentMutation.isPending ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
