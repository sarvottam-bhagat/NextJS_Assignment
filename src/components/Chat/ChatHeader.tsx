
'use client';

import React, { useState } from "react";
import { MoreVertical, Search, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LabelSelector from "./LabelSelector";
import LabelDisplay from "./LabelDisplay";
import { LabelType } from "@/lib/labelConstants";
import GroupChatInfo from "../GroupChat/GroupChatInfo";

// Current user ID (would normally come from authentication)
const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c"; // Periskope user

interface ChatHeaderProps {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  isGroup?: boolean;
  label?: LabelType;
  onLabelChange?: (label: LabelType) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  id,
  name,
  avatar,
  status,
  isGroup,
  label,
  onLabelChange = () => {}
}) => {
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  // Use the isGroup prop if provided, otherwise fall back to inferring from status
  const isGroupChat = isGroup !== undefined ? isGroup : (status && status.includes(","));

  const handleOpenGroupInfo = () => {
    setIsGroupInfoOpen(true);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-medium text-gray-900">{name}</h1>
              {isGroupChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={handleOpenGroupInfo}
                >
                  <Info size={14} className="text-gray-500" />
                </Button>
              )}
              {label && (
                <div className="ml-2">
                  <LabelDisplay label={label} size="sm" />
                </div>
              )}
            </div>
            {status && (
              <p className={`text-xs text-gray-500 ${isGroupChat ? "truncate max-w-[250px]" : ""}`}>
                {isGroupChat
                  ? `${status}` // Display the full list of participants for group chats
                  : status.includes("Online") ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
        <nav className="flex items-center justify-between">
          <img
            src="/Frame 26.svg"
            alt="Test El Centro"
            className="h-6 w-auto"
          />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Search className="h-5 w-5 text-gray-500" />
            </Button>
            {isGroupChat && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleOpenGroupInfo}
              >
                <Users className="h-5 w-5 text-gray-500" />
              </Button>
            )}
            <LabelSelector
              conversationId={id}
              currentLabel={label}
              onLabelChange={onLabelChange}
            />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Group Chat Info Component */}
      {isGroupChat && (
        <GroupChatInfo
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          conversationId={id}
          conversationName={name}
          conversationAvatar={avatar}
          currentUserId={CURRENT_USER_ID}
        />
      )}
    </>
  );
};

export default ChatHeader;
