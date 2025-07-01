"use client";

import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PlusCircle, Edit2, Trash2, GripVertical, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Toaster } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Select from 'react-select';
import { Label } from "@/components/ui/label";
import { AddQuestionModal } from '@/components/admin/questions/add-question-modal';
import { EditQuestionModal } from '@/components/admin/questions/edit-question-modal';
import { adminApi } from "@/lib/api-backend";

interface Question {
  id: string;
  jobIds: string[];
  jobTitles: string[];
  question: string;
  type: string;
  options: string[];
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const questionSchema = z.object({
  jobIds: z.array(z.string()).min(1, "At least one job must be selected"),
  question: z.string().min(1, "Question is required"),
  type: z.enum(["text", "select", "radio", "boolean", "file"]),
  options: z.array(z.string()).superRefine((val, ctx) => {
    const formValues = ctx as unknown as { type: string }; // Type assertion
    if ((formValues.type === "select" || formValues.type === "radio") && val.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required for this question type",
      });
    }
    if (formValues.type === "boolean") {
      return ["Yes", "No"]; // Auto-populate
    }
  }),
  required: z.boolean().default(true),
  order: z.number().default(0),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

// Define a type for question types
type QuestionType = "text" | "select" | "radio" | "boolean" | "file";

// Define options type
interface OptionType {
  value: string;
  label: string;
}

// Define question type options
const questionTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'file', label: 'File Upload' }
];

const fetchQuestions = async (searchTerm?: string) => {
  try {
    return await adminApi.getQuestions(searchTerm);
  } catch (error) {
    throw new Error('Failed to fetch questions');
  }
};

export default function QuestionsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const queryClient = useQueryClient();
  const [showOptions, setShowOptions] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [editShowOptions, setEditShowOptions] = useState(false);
  const [editOptionInput, setEditOptionInput] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [isDndMounted, setIsDndMounted] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const { data: jobsData } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => adminApi.getJobPostings()
  });

  // Extract jobPostings array from response
  const jobs = jobsData?.jobPostings || [];

  const { data: questionsData, isLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ['admin-questions', searchTerm],
    queryFn: () => fetchQuestions(searchTerm)
  });

  // Extract questions array from response
  const questions = questionsData?.questions || [];

  const addForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      jobIds: [],
      question: "",
      type: "text",
      required: true,
      options: [],
      order: 0,
    },
  });

  const editForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      jobIds: [],
      question: "",
      type: "text",
      required: true,
      options: [],
      order: 0,
    },
  });

  const addQuestionMutation = useMutation<any, Error, QuestionFormValues>({
    mutationFn: async (data: QuestionFormValues) => {
      return await adminApi.createQuestion(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast.success('Question added successfully');
      setIsAddOpen(false);
      addForm.reset();
      setOptions([]);
    },
    onError: (error) => {
      toast.error(`Failed to add question: ${error.message}`);
    },
  });

  const editQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      if (!currentQuestion?.id) throw new Error('No question ID');
      return await adminApi.updateQuestion(currentQuestion.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      setIsEditOpen(false);
      toast.success('Question updated successfully');
    },
    onError: () => {
      toast.error('Failed to update question');
    },
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: async (questions: Question[]) => {
      // Only send the id and new order for each question
      const updates = questions.map((question, index) => ({
        id: question.id,
        order: index
      }));
      
      // Log the request payload for debugging
      console.log('Reorder request payload:', { updates });
      
      // Send only the updates array
      const response = await adminApi.reorderQuestions({ updates });
      if (!response) {
        throw new Error('Failed to reorder questions');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast.success('Questions reordered successfully');
    },
    onError: (error: any) => {
      // Show the specific error message from the backend
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to reorder questions';
      toast.error(errorMessage);
      
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
    },
  });

  const onAddSubmit = (data: QuestionFormValues) => {
    addQuestionMutation.mutate(data);
  };

  const onEditSubmit = (data: QuestionFormValues) => {
    if (currentQuestion) {
      editQuestionMutation.mutate(data);
    }
  };

  const handleEdit = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question && jobs) {
      setCurrentQuestion(question);
      
      // Map job IDs to select options
      const selectedJobs = jobs
        .filter(j => question.jobIds.includes(j.id))
        .map(j => ({ value: j.id, label: j.title }));

      editForm.reset({
        jobIds: selectedJobs,
        question: question.question,
        type: question.type as "text" | "select" | "radio" | "boolean" | "file",
        required: question.required,
        options: question.options || [],
        order: question.order,
      });
      setIsEditOpen(true);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !questions) return;

    const items = Array.from(questions) as Question[];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update items with new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Optimistically update UI
    queryClient.setQueryData(['admin-questions'], { questions: updatedItems });

    try {
      await reorderQuestionsMutation.mutateAsync(updatedItems);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const columns = [
    {
      header: "Question",
      accessor: "question",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Required",
      accessor: "required",
      cell: ({ row }) => (row.required ? "Yes" : "No"),
    },
    {
      header: "Options",
      accessor: "options",
      cell: ({ row }) => (
        <span>{Array.isArray(row.options) ? row.options.join(", ") : "N/A"}</span>
      ),
    },
    {
      accessorKey: "jobTitles",
      header: "Associated Jobs",
      cell: ({ row }) => {
        const cellValue = row.jobTitles?.join(', ') || 'No associated jobs';
        return cellValue;
      },
    },
  ];

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsDndMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const DraggableTableBody = ({ questions, onDragEnd, onEdit, onDelete }) => (
    <Droppable droppableId="questions">
      {(provided) => (
        <tbody {...provided.droppableProps} ref={provided.innerRef}>
          {questions.map((row, index) => (
            <Draggable key={row.id} draggableId={row.id} index={index}>
              {(provided) => (
                <tr
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="pl-4 py-4" {...provided.dragHandleProps}>
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  </td>
                  {columns.map((column) => (
                    <td key={column.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.cell ? column.cell({ row }) : row[column.accessor]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(row.id)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(row.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </tbody>
      )}
    </Droppable>
  );

  const handleDelete = (id: string) => {
    setQuestionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      await adminApi.deleteQuestion(questionToDelete);
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast.success('Question deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete question');
    } finally {
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleAddTypeChange = (type: QuestionType) => {
    addForm.setValue('type', type);
    if (type === 'select' || type === 'radio') {
      setShowOptions(true);
    } else if (type === 'boolean') {
      setOptions(['Yes', 'No']);
      addForm.setValue('options', ['Yes', 'No']);
    } else {
      setShowOptions(false);
      setOptions([]);
      addForm.setValue('options', []);
    }
  };

  const handleEditTypeChange = (type: QuestionType) => {
    editForm.setValue('type', type);
    if (type === 'select' || type === 'radio') {
      setEditShowOptions(true);
    } else if (type === 'boolean') {
      setEditOptions(['Yes', 'No']);
      editForm.setValue('options', ['Yes', 'No']);
    } else {
      setEditShowOptions(false);
      setEditOptions([]);
      editForm.setValue('options', []);
    }
  };

  const handleAddOption = (isEdit: boolean) => {
    const optionToAdd = isEdit ? editOptionInput : optionInput;
    if (optionToAdd.trim()) {
      if (isEdit) {
        const newOptions = [...editOptions, optionToAdd.trim()];
        setEditOptions(newOptions);
        editForm.setValue('options', newOptions);
        setEditOptionInput('');
      } else {
        const newOptions = [...options, optionToAdd.trim()];
        setOptions(newOptions);
        addForm.setValue('options', newOptions);
        setOptionInput('');
      }
    }
  };

  const handleRemoveOption = (index: number, isEdit: boolean) => {
    if (isEdit) {
      const newOptions = editOptions.filter((_, i) => i !== index);
      setEditOptions(newOptions);
      editForm.setValue('options', newOptions);
    } else {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      addForm.setValue('options', newOptions);
    }
  };

  // Convert jobs to options
  const jobOptions = jobs.map(job => ({
    value: job.id,
    label: job.title
  })) || [];

  const handleEditClick = (question: Question) => {
    setCurrentQuestion(question);
    editForm.reset({
      ...question,
      jobIds: question.jobIds,
      options: question.options || [],
      type: question.type as "text" | "select" | "radio" | "boolean" | "file"
    });
    setEditOptions(question.options || []);
    setIsEditOpen(true);
  };

  return (
    <AdminPageLayout
      title="Questions Management"
      searchPlaceholder="Search questions..."
      searchValue={searchTerm}
      onSearch={setSearchTerm}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="bg-white rounded-md shadow-sm overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-2"></th>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <DraggableTableBody 
                questions={filteredQuestions || []} 
                onDragEnd={handleDragEnd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </table>
          </div>
        </DragDropContext>
      </div>

      <AddQuestionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        refetchQuestions={refetchQuestions}
        onSubmit={onAddSubmit}
        isLoading={addQuestionMutation.isPending}
        jobOptions={jobOptions}
        showOptions={showOptions}
        options={options}
        optionInput={optionInput}
        handleAddOption={handleAddOption}
        handleRemoveOption={handleRemoveOption}
        handleTypeChange={handleAddTypeChange}
        setOptionInput={setOptionInput}
      />

      <EditQuestionModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        questionId={currentQuestion?.id}
        onSubmit={onEditSubmit}
        isLoading={editQuestionMutation.isPending}
        jobOptions={jobOptions}
        showOptions={editShowOptions}
        options={editOptions}
        optionInput={editOptionInput}
        handleAddOption={handleAddOption}
        handleRemoveOption={handleRemoveOption}
        handleTypeChange={handleEditTypeChange}
        setEditOptionInput={setEditOptionInput}
        setEditOptions={setEditOptions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              and remove it from all job applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
} 