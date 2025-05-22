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

interface BulkLabelSelectorProps {
  selectedConversationIds: string[];
  onLabelsApplied: () => void;
  disabled?: boolean;
}

const BulkLabelSelector: React.FC<BulkLabelSelectorProps> = ({ 
  selectedConversationIds,
  onLabelsApplied,
  disabled = false
}) => {
  const handleSelectLabel = async (labelId: LabelType) => {
    if (selectedConversationIds.length === 0) {
      toast.error("No conversations selected");
      return;
    }

    try {
      // Show loading toast
      toast.loading(`Applying label to ${selectedConversationIds.length} conversations...`);
      
      // Update each conversation with the selected label
      const updatePromises = selectedConversationIds.map(id => 
        updateConversationLabel(id, labelId)
      );
      
      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(success => success === true);
      
      if (allSuccessful) {
        toast.dismiss();
        toast.success(`Label applied to ${selectedConversationIds.length} conversations`);
        onLabelsApplied();
      } else {
        toast.dismiss();
        toast.error("Failed to apply label to some conversations");
      }
    } catch (error) {
      console.error("Error applying bulk labels:", error);
      toast.dismiss();
      toast.error("An error occurred while applying labels");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full"
          disabled={disabled || selectedConversationIds.length === 0}
        >
          <Tag className={`h-5 w-5 ${disabled || selectedConversationIds.length === 0 ? 'text-gray-300' : 'text-gray-500'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Apply Label to {selectedConversationIds.length} Conversation{selectedConversationIds.length !== 1 ? 's' : ''}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.values(LABELS).map((label) => {
          const LabelIcon = label.icon;
          
          return (
            <DropdownMenuItem 
              key={label.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleSelectLabel(label.id as LabelType)}
            >
              <div className={`p-1 rounded-full ${label.bgColor}`}>
                <LabelIcon className={`h-4 w-4 ${label.color}`} />
              </div>
              <span>{label.text}</span>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSelectLabel(null)}
        >
          <div className="p-1 rounded-full bg-gray-100">
            <Tag className="h-4 w-4 text-gray-500" />
          </div>
          <span>Remove Label</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BulkLabelSelector;
