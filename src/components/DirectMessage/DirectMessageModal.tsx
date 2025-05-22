'use client';

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers, User, createDirectMessageConversation, findAnyConversationsBetweenUsers, Conversation } from "@/lib/supabaseService";
import { toast } from "@/components/ui/sonner";
import { Search, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onConversationCreated: (conversationId: string) => void;
}

const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onConversationCreated
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [existingConversations, setExistingConversations] = useState<Conversation[]>([]);
  const [showConversationOptions, setShowConversationOptions] = useState(false);

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

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (user: User) => {
    setLoading(true);
    try {
      console.log(`DirectMessageModal: Starting conversation with user:`, user);

      // First check if there are any existing conversations with this user
      const existingConvs = await findAnyConversationsBetweenUsers(currentUserId, user.id);
      console.log(`DirectMessageModal: Found ${existingConvs.length} existing conversations`);

      if (existingConvs.length > 0) {
        // Show options to user
        setSelectedUser(user);
        setExistingConversations(existingConvs);
        setShowConversationOptions(true);
        setLoading(false);
        return;
      }

      // No existing conversations, create a new direct message
      const conversation = await createDirectMessageConversation(
        currentUserId,
        user.id,
        user.name,
        user.avatar
      );

      console.log(`DirectMessageModal: Conversation result:`, conversation);

      if (conversation) {
        toast.success(`Started conversation with ${user.name}`);
        console.log(`DirectMessageModal: Calling onConversationCreated with ID: ${conversation.id}`);
        onConversationCreated(conversation.id);
        onClose();
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error("Error creating direct message:", error);
      toast.error("Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingConversation = (conversation: Conversation) => {
    console.log(`DirectMessageModal: Selecting existing conversation:`, conversation);
    toast.success(`Opened existing conversation: ${conversation.name}`);
    onConversationCreated(conversation.id);
    onClose();
    setShowConversationOptions(false);
  };

  const handleCreateNewDirectMessage = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const conversation = await createDirectMessageConversation(
        currentUserId,
        selectedUser.id,
        selectedUser.name,
        selectedUser.avatar
      );

      if (conversation) {
        toast.success(`Started new direct message with ${selectedUser.name}`);
        onConversationCreated(conversation.id);
        onClose();
        setShowConversationOptions(false);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error("Error creating direct message:", error);
      toast.error("Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
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
            {filteredUsers.length === 0 ? (
              <div className="flex justify-center py-4">
                <p className="text-sm text-gray-500">
                  {searchTerm ? "No users found" : "Loading users..."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => !loading && handleStartConversation(user)}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.status || "No status"}</p>
                      </div>
                    </div>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>

      {/* Conversation Options Dialog */}
      {showConversationOptions && selectedUser && (
        <Dialog open={showConversationOptions} onOpenChange={() => setShowConversationOptions(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Conversation with {selectedUser.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You already have {existingConversations.length} conversation{existingConversations.length !== 1 ? 's' : ''} with {selectedUser.name}.
                Choose an existing conversation or start a new direct message.
              </p>

              {/* Existing Conversations */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Conversations:</h4>
                {existingConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectExistingConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{conversation.name}</p>
                        <p className="text-xs text-gray-500">
                          {conversation.is_group ? 'Group Chat' : 'Direct Message'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create New Direct Message Button */}
              <div className="pt-2 border-t">
                <button
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  onClick={handleCreateNewDirectMessage}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Start New Direct Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default DirectMessageModal;
