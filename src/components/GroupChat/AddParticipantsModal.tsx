'use client';

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsersNotInConversation, User, addParticipantsToConversation } from "@/lib/supabaseService";
import { toast } from "@/components/ui/sonner";
import { Search, Loader2 } from "lucide-react";

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  onParticipantsAdded: () => void;
}

const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  onParticipantsAdded
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users not in the conversation
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !conversationId) return;
      
      setLoading(true);
      try {
        const availableUsers = await getUsersNotInConversation(conversationId);
        setUsers(availableUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, conversationId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add selected users to the conversation
      const success = await addParticipantsToConversation(conversationId, selectedUsers);

      if (success) {
        toast.success(`Added ${selectedUsers.length} participants to the conversation`);
        onParticipantsAdded();
        onClose();
      } else {
        throw new Error('Failed to add participants');
      }
    } catch (error) {
      console.error("Error adding participants:", error);
      toast.error("Failed to add participants");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Participants</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Input
              className="pl-9 bg-gray-100 border-0 text-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex justify-center py-4">
                <p className="text-sm text-gray-500">
                  {searchTerm ? "No users found" : "No users available to add"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserSelect(user.id)}
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="cursor-pointer flex-1"
                      >
                        {user.name}
                      </Label>
                    </div>
                    <div className="text-xs text-gray-500">{user.status}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddParticipants} 
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantsModal;
