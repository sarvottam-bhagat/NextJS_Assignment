import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Supported file types
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'text/plain',
  'text/csv'
];

export const SUPPORTED_FILE_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Get the file type category based on MIME type
 */
export const getFileTypeCategory = (mimeType: string): 'image' | 'video' | 'document' | 'other' => {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
  return 'other';
};

/**
 * Validate a file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }
  
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not supported' 
    };
  }
  
  return { valid: true };
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (file: File): Promise<UploadedFile | null> => {
  try {
    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Generate a unique file name to prevent collisions
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(`attachments/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(`attachments/${fileName}`);
    
    return {
      url: publicUrl,
      name: file.name,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(filePath);
    const path = url.pathname.split('/').slice(2).join('/');
    
    const { error } = await supabase.storage
      .from('chat-attachments')
      .remove([path]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
