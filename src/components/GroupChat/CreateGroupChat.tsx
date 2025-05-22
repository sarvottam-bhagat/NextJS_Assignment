'use client';

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers, User, createConversation, addParticipantsToConversation } from "@/lib/supabaseService";
import { toast } from "@/components/ui/sonner";

interface CreateGroupChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onGroupCreated: (conversationId: string) => void;
}

const CreateGroupChat: React.FC<CreateGroupChatProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onGroupCreated
}) => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getUsers();
        // Filter out the current user
        const filteredUsers = allUsers.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentUserId]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateGroup = async () => {
    // Validate group name
    if (!groupName.trim()) {
      setNameError("Group name is required");
      return;
    }

    // Validate at least one user is selected
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user for the group");
      return;
    }

    setLoading(true);
    try {
      // Create the conversation
      const newConversation = await createConversation({
        name: groupName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}`
      });

      if (newConversation) {
        // Add all participants including the current user
        const allParticipants = [...selectedUsers, currentUserId];
        await addParticipantsToConversation(newConversation.id, allParticipants);

        toast.success("Group chat created successfully");
        onGroupCreated(newConversation.id);

        // Reset form
        setGroupName("");
        setSelectedUsers([]);
        onClose();
      }
    } catch (error) {
      console.error("Error creating group chat:", error);
      toast.error("Failed to create group chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setNameError("");
              }}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <Label>Select Participants</Label>
            <ScrollArea className="h-60 border rounded-md p-2">
              <div className="space-y-2">
                {users.map((user) => (
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
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
              </div>
            </ScrollArea>
            <p className="text-xs text-gray-500">
              Selected: {selectedUsers.length} user(s)
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={loading || selectedUsers.length === 0 || !groupName.trim()}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupChat;
