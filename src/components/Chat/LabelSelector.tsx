'use client';

import React from "react";
import { Tag } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LABELS, LabelType } from "@/lib/labelConstants";
import { toast } from "@/components/ui/sonner";
import { updateConversationLabel } from "@/lib/supabaseService";

interface LabelSelectorProps {
  conversationId: string;
  currentLabel: LabelType;
  onLabelChange: (label: LabelType) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({ 
  conversationId, 
  currentLabel,
  onLabelChange
}) => {
  const handleSelectLabel = async (labelId: LabelType) => {
    try {
      // If selecting the same label, remove it (toggle behavior)
      const newLabel = currentLabel === labelId ? null : labelId;
      
      // Update the label in the database
      const success = await updateConversationLabel(conversationId, newLabel);
      
      if (success) {
        // Update the UI
        onLabelChange(newLabel);
        
        // Show success message
        const action = newLabel ? `set to ${LABELS[newLabel].text}` : 'removed';
        toast.success(`Label ${action}`);
      } else {
        toast.error("Failed to update label");
      }
    } catch (error) {
      console.error("Error updating label:", error);
      toast.error("An error occurred while updating the label");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Tag className="h-5 w-5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Assign Label</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.values(LABELS).map((label) => {
          const isSelected = currentLabel === label.id;
          const LabelIcon = label.icon;
          
          return (
            <DropdownMenuItem 
              key={label.id}
              className={`flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
              onClick={() => handleSelectLabel(label.id as LabelType)}
            >
              <div className={`p-1 rounded-full ${label.bgColor}`}>
                <LabelIcon className={`h-4 w-4 ${label.color}`} />
              </div>
              <span>{label.text}</span>
              {isSelected && (
                <span className="ml-auto text-xs text-gray-500">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LabelSelector;
