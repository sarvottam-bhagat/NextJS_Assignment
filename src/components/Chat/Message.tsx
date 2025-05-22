'use client';

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileIcon, ImageIcon, VideoIcon, FileTextIcon, Download } from "lucide-react";
import { getFileTypeCategory } from "@/lib/fileUploadService";

interface MessageProps {
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  senderName?: string;
  senderAvatar?: string;
  attachmentType?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isRead?: boolean;
  isDelivered?: boolean;
  recipientOnline?: boolean;
}

const Message: React.FC<MessageProps> = ({
  content,
  timestamp,
  isOutgoing,
  senderName,
  senderAvatar,
  attachmentType,
  attachmentUrl,
  attachmentName,
  attachmentSize,
  isRead = false,
  isDelivered = true,
  recipientOnline = false,
}) => {
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Determine if message has an attachment
  const hasAttachment = attachmentUrl && attachmentType;

  // Get file type category
  const fileCategory = attachmentType ? getFileTypeCategory(attachmentType) : null;

  // Determine tick color based on recipient online status
  const getTickColor = () => {
    if (recipientOnline) {
      return "text-blue-500"; // Blue ticks when recipient is online
    }
    return "text-gray-400"; // Gray ticks when recipient is offline
  };

  // Double tick component
  const DoubleTick = () => (
    <div className="flex items-center ml-1">
      {/* First tick */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-3 w-3 ${getTickColor()}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {/* Second tick (slightly offset) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-3 w-3 -ml-1 ${getTickColor()}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
  return (
    <article className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div className="max-w-[70%]">
        {!isOutgoing && senderName && (
          <header className="text-xs text-green-600 font-medium mb-1">
            {senderName}
          </header>
        )}
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOutgoing
              ? "bg-green-100 text-gray-800"
              : "bg-white border border-gray-200"
          )}
        >
          {/* Display attachment based on type */}
          {hasAttachment && (
            <figure className="mb-2">
              {fileCategory === 'image' && (
                <img
                  src={attachmentUrl}
                  alt={attachmentName || 'Image attachment'}
                  className="rounded-md max-h-60 max-w-full object-contain cursor-pointer"
                  onClick={() => window.open(attachmentUrl, '_blank')}
                />
              )}

              {fileCategory === 'video' && (
                <video
                  src={attachmentUrl}
                  controls
                  className="rounded-md max-h-60 max-w-full"
                />
              )}

              {(fileCategory === 'document' || fileCategory === 'other') && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors mb-2"
                >
                  <div className="mr-2 text-gray-500">
                    {fileCategory === 'document' ? (
                      <FileTextIcon size={24} />
                    ) : (
                      <FileIcon size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {attachmentName || 'File attachment'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(attachmentSize)}
                    </div>
                  </div>
                  <Download size={16} className="text-gray-400" />
                </a>
              )}
              {attachmentName && <figcaption className="sr-only">{attachmentName}</figcaption>}
            </figure>
          )}

          {/* Display message content */}
          {content && <p>{content}</p>}
        </div>
        <footer className="flex justify-end items-center mt-1 text-xs text-gray-500">
          <time>{timestamp}</time>
          {isOutgoing && <DoubleTick />}
        </footer>
      </div>
    </article>
  );
};

export default Message;
