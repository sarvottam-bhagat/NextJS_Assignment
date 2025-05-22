import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import DirectMessageModal from "./DirectMessageModal";

// Current user ID (would normally come from authentication)
const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c"; // Periskope user

interface FloatingChatButtonProps {
  onConversationCreated: (conversationId: string) => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onConversationCreated
}) => {
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState(false);

  const handleOpenDirectMessage = () => {
    setIsDirectMessageOpen(true);
  };

  return (
    <>
      <button
        className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors z-10"
        onClick={handleOpenDirectMessage}
        aria-label="Start new chat"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <DirectMessageModal
        isOpen={isDirectMessageOpen}
        onClose={() => setIsDirectMessageOpen(false)}
        currentUserId={CURRENT_USER_ID}
        onConversationCreated={onConversationCreated}
      />
    </>
  );
};

export default FloatingChatButton;
