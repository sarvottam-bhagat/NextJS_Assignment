
'use client';

import React from "react";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { LabelType } from "@/lib/labelConstants";
import LabelDisplay from "@/components/Chat/LabelDisplay";
import { Checkbox } from "@/components/ui/checkbox";

interface ConversationItemProps {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isActive?: boolean;
  tags?: string[];
  onClick?: () => void;
  searchTerm?: string;
  isGroup?: boolean;
  status?: string;
  label?: LabelType;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  id: string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  id,
  avatar,
  name,
  lastMessage,
  time,
  unread = 0,
  isActive = false,
  tags = [],
  onClick,
  searchTerm = '',
  isGroup = false,
  status,
  label,
  selectable = false,
  isSelected = false,
  onSelect,
}) => {
  // Function to highlight the matching part of the name
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-green-100 text-green-800 font-medium">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };
  // Handle checkbox click without triggering the conversation click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(id, !isSelected);
    }
  };

  return (
    <li
      className={cn(
        "flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100",
        isActive && "bg-gray-100",
        isSelected && "bg-green-50"
      )}
      onClick={onClick}
    >
      {selectable && (
        <div className="mr-2" onClick={handleCheckboxClick}>
          <Checkbox checked={isSelected} />
        </div>
      )}
      <article className="flex items-center w-full">
        <figure className="relative mr-3">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {label && (
            <figcaption className="absolute -bottom-1 -right-1">
              <LabelDisplay label={label} size="sm" />
            </figcaption>
          )}
        </figure>
        <div className="flex-1 min-w-0">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              {isGroup && <Users size={14} className="text-gray-500" aria-label="Group chat" />}
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {highlightMatch(name, searchTerm)}
              </h3>
            </div>
            <time className="text-xs text-gray-500">{time}</time>
          </header>
          {isGroup ? (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{status}</p>
          ) : (
            <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
          )}
          {tags && tags.length > 0 && (
            <footer className="flex gap-1 mt-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-1.5 bg-gray-100 text-gray-500 rounded"
                >
                  {tag}
                </span>
              ))}
            </footer>
          )}
        </div>
        {unread > 0 && (
          <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${unread} unread messages`}>
            {unread}
          </span>
        )}
      </article>
    </li>
  );
};

export default ConversationItem;
