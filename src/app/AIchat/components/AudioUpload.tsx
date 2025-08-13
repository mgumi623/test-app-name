import React, { useRef, useState } from 'react';
import { Mic, Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export default function AudioUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  disabled = false 
}: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isAudioFile(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('音声ファイル（MP3, WAV, M4A, OGG）を選択してください。');
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
    if (file && isAudioFile(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('音声ファイル（MP3, WAV, M4A, OGG）を選択してください。');
    }
  };

  const isAudioFile = (file: File): boolean => {
    const audioTypes = [
      'audio/mpeg',     // MP3
      'audio/wav',      // WAV
      'audio/mp4',      // M4A
      'audio/x-m4a',    // M4A
      'audio/ogg',      // OGG
      'audio/webm',     // WebM
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const audioExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'webm'];
    
    return audioTypes.includes(file.type) || (fileExtension && audioExtensions.includes(fileExtension));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <File className="w-4 h-4 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-800 truncate">{selectedFile.name}</p>
          <p className="text-xs text-blue-600">{formatFileSize(selectedFile.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFileRemove}
          className="w-6 h-6 text-blue-600 hover:text-blue-800"
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
        ${dragActive 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
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
        accept="audio/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="flex items-center space-x-2 mb-2">
          <Mic className="w-5 h-5 text-gray-500" />
          <Upload className="w-5 h-5 text-gray-500" />
        </div>
        <p className="text-sm text-gray-600 mb-1">
          音声ファイルをドロップまたはクリックして選択
        </p>
        <p className="text-xs text-gray-500">
          対応形式: MP3, WAV, M4A, OGG
        </p>
      </div>
    </div>
  );
}