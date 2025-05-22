'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Users, MessageSquare, BellRing, Tag } from "lucide-react";
import { LABELS } from "@/lib/labelConstants";
import { toast } from "@/components/ui/sonner";

export interface FilterOptions {
  conversationType: 'all' | 'group' | 'direct';
  labels: string[];
  unreadOnly: boolean;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  participantId?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleConversationTypeChange = (value: 'all' | 'group' | 'direct') => {
    setFilters(prev => ({ ...prev, conversationType: value }));
  };

  const handleLabelToggle = (labelId: string) => {
    setFilters(prev => {
      const newLabels = prev.labels.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...prev.labels, labelId];
      return { ...prev, labels: newLabels };
    });
  };

  const handleUnreadToggle = (checked: boolean) => {
    setFilters(prev => ({ ...prev, unreadOnly: checked }));
  };

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      conversationType: 'all',
      labels: [],
      unreadOnly: false,
      dateRange: { from: undefined, to: undefined },
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);

    // Clear saved filters from localStorage
    localStorage.removeItem('chatFilters');

    // Show toast message
    toast.success('All filters have been reset');

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Conversations</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4 py-4">
          {/* Conversation Type Filter */}
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Conversation Type</legend>
            <RadioGroup
              value={filters.conversationType}
              onValueChange={(value) => handleConversationTypeChange(value as 'all' | 'group' | 'direct')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Conversations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="flex items-center gap-1">
                  <Users size={16} aria-hidden="true" /> Group Chats
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct" className="flex items-center gap-1">
                  <MessageSquare size={16} aria-hidden="true" /> Direct Messages
                </Label>
              </div>
            </RadioGroup>
          </fieldset>

          {/* Labels Filter */}
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium flex items-center gap-1">
              <Tag size={16} aria-hidden="true" /> Labels
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(LABELS).map((label) => {
                const LabelIcon = label.icon;
                return (
                  <div key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`label-${label.id}`}
                      checked={filters.labels.includes(label.id)}
                      onCheckedChange={() => handleLabelToggle(label.id)}
                    />
                    <Label htmlFor={`label-${label.id}`} className="flex items-center gap-1">
                      <LabelIcon className={`h-4 w-4 ${label.color}`} aria-hidden="true" />
                      <span>{label.text}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* Unread Messages Filter */}
          <fieldset className="flex items-center space-x-2">
            <Checkbox
              id="unread"
              checked={filters.unreadOnly}
              onCheckedChange={(checked) => handleUnreadToggle(checked as boolean)}
            />
            <Label htmlFor="unread" className="flex items-center gap-1">
              <BellRing size={16} aria-hidden="true" /> Unread Messages Only
            </Label>
          </fieldset>

          {/* Date Range Filter */}
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Date Range</legend>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "PPP")} - {format(filters.dateRange.to, "PPP")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "PPP")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </fieldset>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
