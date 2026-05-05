import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  userId: string;
  pathPrefix: string;
}

export default function ImageUpload({ onImageUploaded, currentImage, userId, pathPrefix }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${pathPrefix}/${userId}-${Date.now()}.${ext}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      onImageUploaded(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image', error);
      toast.error('Failed to upload image. Storage rules might be restricting access.');
      // Fallback: we could pass back the base64 preview if we wanted to store it in firestore
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {preview ? (
        <div className="relative group">
          <img 
            src={preview} 
            alt="Profile Preview" 
            className="w-32 h-32 object-cover rounded-full border-4 border-slate-100 shadow-md"
          />
          <button
            onClick={() => {
              setPreview(null);
              onImageUploaded('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            title="Remove picture"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-400 hover:text-slate-500 transition-all"
        >
          <ImageIcon size={28} className="mb-2" />
          <span className="text-xs font-semibold">Upload</span>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {uploading && (
        <div className="text-xs font-semibold text-blue-600 animate-pulse">
          Uploading...
        </div>
      )}
      {!preview && !uploading && (
        <p className="text-xs text-slate-400 max-w-[160px]">
          Upload a clear photo. Max size 2MB.
        </p>
      )}
    </div>
  );
}
