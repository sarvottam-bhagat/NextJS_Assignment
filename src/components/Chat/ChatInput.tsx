
'use client';

import React, { useState, useRef } from "react";
import { Smile, Paperclip, Mic, X, Camera, Calendar, MapPin } from "lucide-react";
import AttachmentUploader from "./AttachmentUploader";
import { toast } from "@/components/ui/sonner";
import GifIcon from "@/components/icons/GifIcon";

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentSelected = (file: File) => {
    setSelectedFile(file);
    setAttachmentPreview({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    });
    setShowAttachmentUploader(false);
    toast.success("Attachment ready to send");
  };

  const handleCancelAttachment = () => {
    setSelectedFile(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Send message with or without attachment
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setAttachmentPreview(null);
    }
  };

  return (
    <>
      {showAttachmentUploader ? (
        <AttachmentUploader
          onAttachmentSelected={handleAttachmentSelected}
          onCancel={() => setShowAttachmentUploader(false)}
        />
      ) : (
        <footer className="border-t border-gray-200 bg-white p-3">
          {attachmentPreview && (
            <div className="mb-2 p-2 bg-gray-50 rounded-md border border-gray-200 flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{attachmentPreview.name}</p>
                <p className="text-xs text-gray-500">{attachmentPreview.size}</p>
              </div>
              <button
                type="button"
                className="ml-2 p-1 rounded-full hover:bg-gray-200"
                onClick={handleCancelAttachment}
                aria-label="Remove attachment"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <nav className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowAttachmentUploader(true)}
                aria-label="Add attachment"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Take photo"
              >
                <Camera className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Send GIF"
              >
                <GifIcon size={20} className="text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Share location"
              >
                <MapPin className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Schedule message"
              >
                <Calendar className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Voice message"
              >
                <Mic className="h-5 w-5 text-gray-500" />
              </button>
            </nav>
            <div className="flex-1 min-w-0 rounded-full bg-white border border-gray-200">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-transparent outline-none"
                placeholder={selectedFile ? "Add a message..." : "Message..."}
                aria-label="Message input"
              />
            </div>
            <nav className="flex items-center">
              <button
                type="submit"
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!message.trim() && !selectedFile}
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </form>
        </footer>
      )}
    </>
  );
};

export default ChatInput;
