import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import Select from 'react-select';
import { Label } from "@/components/ui/label";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface QuestionFormValues {
  jobIds: Array<{ value: string; label: string }>;
  question: string;
  type: "text" | "select" | "radio" | "boolean" | "file";
  options?: string[];
  required: boolean;
  order: number;
}

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

export function AddQuestionModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  jobOptions,
  showOptions,
  options,
  optionInput,
  handleAddOption,
  handleRemoveOption,
  handleTypeChange,
  editOptionInput,
  setOptionInput
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  jobOptions: any[];
  showOptions: boolean;
  options: string[];
  optionInput: string;
  handleAddOption: (isEdit: boolean) => void;
  handleRemoveOption: (index: number, isEdit: boolean) => void;
  handleTypeChange: (type: "text" | "select" | "radio" | "boolean" | "file") => void;
  editOptionInput?: never;
  setOptionInput: (value: string) => void;
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
    },
  });

  const handleLocalTypeChange = (type: QuestionFormValues['type']) => {
    form.setValue('type', type);
    handleTypeChange(type);
  };

  const handleSubmit = (values: QuestionFormValues) => {
    const finalValues = {
      ...values,
      jobIds: values.jobIds.map(job => job.value),
      options: values.type === 'boolean' ? ['Yes', 'No'] : options
    };
    onSubmit(finalValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Form fields replicated from original */}
            <FormField
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Other form fields */}
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Question'}
              </Button>
            </div>

            {showOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Add option"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddOption(false)}
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
                        onClick={() => handleRemoveOption(index, false)}
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
              name="jobIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Jobs</FormLabel>
                  <FormControl>
                    <Select
                      options={jobOptions}
                      isMulti
                      value={field.value}
                      onChange={(selected: unknown) => 
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <UISelect onValueChange={handleLocalTypeChange} value={field.value}>
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