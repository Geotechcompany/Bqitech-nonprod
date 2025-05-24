import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import Select from 'react-select';
import { Label } from "@/components/ui/label";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const questionSchema = z.object({
  jobIds: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, "At least one job must be selected"),
  question: z.string().min(1, "Question is required"),
  type: z.enum(["text", "select", "radio", "boolean", "file"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  order: z.number().default(0),
});

interface QuestionFormValues {
  jobIds: Array<{ value: string; label: string }>;
  question: string;
  type: "text" | "select" | "radio" | "boolean" | "file";
  options?: string[];
  required: boolean;
  order: number;
}

export function EditQuestionModal({
  open,
  onOpenChange,
  questionId,
  onSubmit,
  isLoading,
  jobOptions,
  showOptions,
  options,
  optionInput,
  handleAddOption,
  handleRemoveOption,
  handleTypeChange: onTypeChange,
  editOptionInput,
  setEditOptionInput,
  setEditOptions
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  jobOptions: any[];
  showOptions: boolean;
  options: string[];
  optionInput: string;
  handleAddOption: (isEdit: boolean) => void;
  handleRemoveOption: (index: number, isEdit: boolean) => void;
  handleTypeChange: (type: "text" | "select" | "radio" | "boolean" | "file") => void;
  editOptionInput: string;
  setEditOptionInput: (value: string) => void;
  setEditOptions: (options: string[]) => void;
}) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      jobIds: [],
      question: "",
      type: "text",
      required: true,
      options: [],
      order: 0,
    }
  });

  const [fetchedQuestion, setFetchedQuestion] = useState<any>(null);

  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const [questionRes, associationsRes] = await Promise.all([
        fetch(`/api/admin/questions/${questionId}`),
        fetch('/api/admin/questions/job-associations')
      ]);
      
      if (!questionRes.ok || !associationsRes.ok) {
        throw new Error('Failed to fetch question data');
      }

      const question = await questionRes.json();
      const associations = await associationsRes.json();

      // Find matching association
      const association = associations.find(
        (a: any) => a.questionId === questionId
      );

      return {
        ...question,
        jobTitles: association?.jobTitles || []
      };
    },
    enabled: open && !!questionId,
    staleTime: 0
  });

  useEffect(() => {
    if (questionData) {
      const jobOptions = (questionData.jobIds || []).map((id: string, index: number) => ({
        value: id,
        label: (questionData.jobTitles?.[index] || 'Unknown Job')
      }));

      // Handle different question types
      let finalOptions = questionData.options || [];
      if (questionData.type === 'boolean') {
        finalOptions = ['Yes', 'No'];
      }

      form.reset({
        ...questionData,
        jobIds: jobOptions,
        options: finalOptions,
        type: questionData.type as "text" | "select" | "radio" | "boolean" | "file"
      });
      
      // Update local options state
      setEditOptions(finalOptions);
      setEditOptionInput('');
    }
  }, [questionData, form]);

  if (isQuestionLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = (values: QuestionFormValues) => {
    const finalValues = {
      ...values,
      jobIds: values.jobIds.map(job => job.value),
      options: values.type === 'boolean' ? ['Yes', 'No'] : form.getValues('options'),
      id: questionId,
      createdAt: fetchedQuestion?.createdAt,
      updatedAt: new Date().toISOString()
    };
    onSubmit(finalValues);
  };

  const handleLocalTypeChange = (type: "text" | "select" | "radio" | "boolean" | "file") => {
    onTypeChange(type);
    
    // Reset options based on type
    if (type === 'boolean') {
      form.setValue('options', ['Yes', 'No']);
      setEditOptions(['Yes', 'No']);
    } else {
      form.setValue('options', options);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter question text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Jobs</FormLabel>
                  <FormControl>
                    <Select
                      options={jobOptions}
                      isMulti
                      value={field.value}
                      onChange={(selected) => 
                        field.onChange(selected as Array<{ value: string; label: string }>)
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Required</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {showOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={editOptionInput}
                    onChange={(e) => setEditOptionInput(e.target.value)}
                    placeholder="Add option"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddOption(true)}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      {option}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index, true)}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <UISelect 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTypeChange?.(value as any);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="radio">Multiple Choice</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                      <SelectItem value="file">File Upload</SelectItem>
                    </SelectContent>
                  </UISelect>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 