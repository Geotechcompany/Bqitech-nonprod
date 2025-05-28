"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  notFoundText = "No results found",
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedValues = new Set(value || []);
  const selectedOptions = options.filter(opt => selectedValues.has(opt.value));

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    const currentValues = value || [];
    if (multiple) {
      const newValues = selectedValues.has(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange([optionValue]);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {multiple ? (
              selectedOptions.map(opt => (
                <Badge key={opt.value} className="mb-1 mr-1">
                  {opt.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                  />
                </Badge>
              ))
            ) : (
              <span>{selectedOptions[0]?.label || placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{notFoundText}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map(opt => (
              <CommandItem
                key={opt.value}
                value={opt.value}
                onSelect={() => handleSelect(opt.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selectedValues.has(opt.value) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}