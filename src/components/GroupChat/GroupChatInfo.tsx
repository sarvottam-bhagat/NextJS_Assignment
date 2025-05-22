import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getConversationParticipants,
  removeParticipantFromConversation,
  User
} from "@/lib/supabaseService";
import { X, UserPlus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import AddParticipantsModal from "./AddParticipantsModal";

interface GroupChatInfoProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  conversationAvatar: string;
  currentUserId: string;
}

const GroupChatInfo: React.FC<GroupChatInfoProps> = ({
  isOpen,
  onClose,
  conversationId,
  conversationName,
  conversationAvatar,
  currentUserId
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);

  const fetchParticipants = async () => {
    if (!isOpen || !conversationId) return;

    setLoading(true);
    try {
      const users = await getConversationParticipants(conversationId);
      setParticipants(users);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
    }
  }, [conversationId, isOpen]);

  const handleRemoveParticipant = async (userId: string) => {
    if (!conversationId) return;

    // Don't allow removing the last participant
    if (participants.length <= 1) {
      toast.error("Cannot remove the last participant from a conversation");
      return;
    }

    setRemovingUserId(userId);
    try {
      const success = await removeParticipantFromConversation(conversationId, userId);

      if (success) {
        // Update the participants list
        setParticipants(prev => prev.filter(p => p.id !== userId));
        toast.success("Participant removed successfully");
      } else {
        throw new Error("Failed to remove participant");
      }
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error("Failed to remove participant");
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleOpenAddParticipants = () => {
    setIsAddParticipantsOpen(true);
  };

  const handleParticipantsAdded = () => {
    // Refresh the participants list
    fetchParticipants();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[300px] sm:w-[400px]">
          <SheetHeader className="text-left">
            <SheetTitle>Group Information</SheetTitle>
            <SheetDescription>
              View and manage group participants
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={conversationAvatar} alt={conversationName} />
              <AvatarFallback>{conversationName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{conversationName}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {participants.length} participants
            </p>
          </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Participants</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={handleOpenAddParticipants}
            >
              <UserPlus size={16} />
              <span>Add</span>
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user.name} {user.id === currentUserId && "(You)"}
                        </p>
                        <p className="text-xs text-gray-500">{user.status || "No status"}</p>
                      </div>
                    </div>
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleRemoveParticipant(user.id)}
                        disabled={removingUserId === user.id}
                      >
                        {removingUserId === user.id ? (
                          <Loader2 size={14} className="animate-spin text-gray-500" />
                        ) : (
                          <X size={14} className="text-gray-500" />
                        )}
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="mt-6 flex justify-end">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>

    {/* Add Participants Modal */}
    <AddParticipantsModal
      isOpen={isAddParticipantsOpen}
      onClose={() => setIsAddParticipantsOpen(false)}
      conversationId={conversationId}
      onParticipantsAdded={handleParticipantsAdded}
    />
  </>
  );
};

export default GroupChatInfo;
