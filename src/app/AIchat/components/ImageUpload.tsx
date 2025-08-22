import React, { useRef, useState } from 'react';
import { Image, X, File } from 'lucide-react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export default function ImageUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  disabled = false 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isImageFile(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('画像ファイル（JPG, PNG, GIF, WebP）を選択してください。');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && isImageFile(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('画像ファイル（JPG, PNG, GIF, WebP）を選択してください。');
    }
  };

  const isImageFile = (file: File): boolean => {
    const imageTypes = [
      'image/jpeg',     // JPG
      'image/jpg',      // JPG
      'image/png',      // PNG
      'image/gif',      // GIF
      'image/webp',     // WebP
      'image/bmp',      // BMP
      'image/tiff',     // TIFF
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
    
    return imageTypes.includes(file.type) || (!!fileExtension && imageExtensions.includes(fileExtension));
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  if (selectedFile) {
    return (
      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded text-xs">
        <File className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
        <span className="text-green-800 truncate flex-1 text-xs">{selectedFile.name}</span>
        <button
          type="button"
          onClick={onFileRemove}
          className="w-3 h-3 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
          disabled={disabled}
        >
          <X className="w-2 h-2" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg transition-colors cursor-pointer p-4 text-center
        ${dragActive 
          ? 'border-green-400 bg-green-50' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center space-y-2">
        <Image className="w-8 h-8 text-gray-400" />
        <div className="text-sm">
          <span className="text-gray-600 font-medium">クリックして画像を選択</span>
          <br />
          <span className="text-gray-500 text-xs">またはドラッグ&ドロップ</span>
        </div>
      </div>
    </div>
  );
}