import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import ReactSelect from 'react-select';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
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
  handleTypeChange,
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
      const jobIdsOptions = questionData.jobTitles.map(job => ({
        value: job._id,
        label: job.title
      }));

      form.reset({
        ...questionData,
        jobIds: jobIdsOptions,
        options: questionData.options || [],
        type: questionData.type
      });

      setEditOptions(questionData.options || []);
    }
  }, [questionData, form, setEditOptions]);

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
    handleTypeChange(type);
    
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Question</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Job Associations */}
              <FormField
                name="jobIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Associated Jobs</FormLabel>
                    <FormControl>
                      <ReactSelect
                        isMulti
                        options={jobOptions}
                        value={field.value}
                        onChange={field.onChange}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Text */}
              <FormField
                name="question"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Type */}
              <FormField
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="radio">Multiple Choice</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display Order */}
              <FormField
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

              {/* Required Switch */}
              <FormField
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                      <FormLabel>Required</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Options Section */}
            {showOptions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Response Options</FormLabel>
                  <span className="text-sm text-muted-foreground">
                    {options.length} option(s) added
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setEditOptionInput(e.target.value)}
                    placeholder="Add new option"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddOption(true)}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddOption(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                      <span className="text-sm">{option}</span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveOption(index, true)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Discard Changes
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 