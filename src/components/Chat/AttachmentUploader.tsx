'use client';

import React, { useState, useRef } from 'react';
import { X, FileIcon, ImageIcon, VideoIcon, FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  MAX_FILE_SIZE
} from '@/lib/fileUploadService';

interface AttachmentUploaderProps {
  onAttachmentSelected: (file: File) => void;
  onCancel: () => void;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onAttachmentSelected,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
    const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(file.type);

    if (!isImage && !isVideo && !isDocument) {
      setError('File type not supported');
      return;
    }

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onAttachmentSelected(selectedFile);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    if (SUPPORTED_IMAGE_TYPES.includes(selectedFile.type)) {
      return <ImageIcon size={24} />;
    } else if (SUPPORTED_VIDEO_TYPES.includes(selectedFile.type)) {
      return <VideoIcon size={24} />;
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(selectedFile.type)) {
      return <FileTextIcon size={24} />;
    } else {
      return <FileIcon size={24} />;
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Add Attachment</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onCancel}
          >
            <X size={16} />
          </Button>
        </div>

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES, ...SUPPORTED_DOCUMENT_TYPES].join(',')}
            />
            <Button
              variant="outline"
              onClick={handleSelectFile}
              className="mb-2"
            >
              Select File
            </Button>
            <p className="text-xs text-gray-500">
              Max file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded mr-3"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded mr-3 text-gray-500">
                  {getFileIcon()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-3 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedFile}
          >
            Attach
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentUploader;
