import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import ReactSelect from 'react-select';
import { X, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOptions: { value: string; label: string }[];
  refetchQuestions: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<unknown, Error>>;
  onSubmit: (data: QuestionFormValues) => void;
  isLoading: boolean;
  showOptions: boolean;
  options: string[];
  optionInput: string;
  handleAddOption: (isEdit: boolean) => void;
  handleRemoveOption: (index: number, isEdit: boolean) => void;
  handleTypeChange: (type: string) => void;
  setOptionInput: React.Dispatch<React.SetStateAction<string>>;
}

interface QuestionFormValues {
  jobIds: string[];
  question: string;
  type: "text" | "select" | "radio" | "boolean" | "file";
  required: boolean;
  options: string[];
  order: number;
  description?: string;
}

export function AddQuestionModal({
  open,
  onOpenChange,
  jobOptions,
  refetchQuestions,
  handleRemoveOption
}: AddQuestionModalProps) {
  const form = useForm<QuestionFormValues>({
    defaultValues: {
      jobIds: [],
      question: "",
      type: "text",
      required: true,
      options: [],
      order: 0
    }
  });

  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const showOptions = ["select", "radio"].includes(form.watch("type"));

  const { mutate: submitQuestion, isPending } = useMutation<
    any, 
    Error, 
    QuestionFormValues
  >({
    mutationFn: async (data) => {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          jobIds: data.jobIds || [],
          options: options ?? []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Question created successfully");
      form.reset();
      setOptions([]);
      refetchQuestions();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error creating question: ${error.message}`);
    }
  });

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions(prev => [...prev, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleTypeChange = (type: string) => {
    if (!["select", "radio"].includes(type)) {
      setOptions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex">
          <ScrollArea className="h-[600px] w-full p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Plus className="h-6 w-6" />
                Create New Question
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitQuestion(data))} className="space-y-6">
                <Card>
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">Job Associations</span>
                      <HoverCard>
                        <HoverCardTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          Select the job postings where this question should appear
                        </HoverCardContent>
                      </HoverCard>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormField
                      name="jobIds"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Associated Jobs</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 gap-3">
                              {jobOptions.map((job) => (
                                <div
                                  key={job.value}
                                  className="flex items-center space-x-3 bg-muted/50 rounded-lg p-3"
                                >
                                  <Checkbox
                                    id={job.value}
                                    checked={field.value?.includes(job.value)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), job.value]
                                        : (field.value || []).filter((v: string) => v !== job.value);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <Label
                                    htmlFor={job.value}
                                    className="text-sm font-medium leading-none"
                                  >
                                    {job.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">Question Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <FormField
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your question" className="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleTypeChange(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="radio">Multiple Choice</SelectItem>
                                <SelectItem value="boolean">Yes/No Toggle</SelectItem>
                                <SelectItem value="file">File Upload</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="required"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Required Question</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Should candidates be required to answer this question?
                            </p>
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
                  </CardContent>
                </Card>

                {showOptions && (
                  <Card>
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-lg">Response Options</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={optionInput}
                          onChange={(e) => setOptionInput(e.target.value)}
                          placeholder="Add new option"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                        />
                        <Button
                          type="button"
                          onClick={handleAddOption}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>

                      {options?.map((option, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                          <span className="text-sm">{option}</span>
                          <Button
                            type="button"
                            onClick={() => handleRemoveOption(index, false)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {isPending ? 'Creating...' : 'Create Question'}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 