import React, { useRef, useState } from 'react';
import { Mic, X, File } from 'lucide-react';

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
    
    return audioTypes.includes(file.type) || (!!fileExtension && audioExtensions.includes(fileExtension));
  };


  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs">
        <File className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
        <span className="text-blue-800 truncate flex-1 text-xs">{selectedFile.name}</span>
        <button
          type="button"
          onClick={onFileRemove}
          className="w-3 h-3 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
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
        relative border border-dashed rounded transition-colors cursor-pointer py-0.5 px-1.5
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
      
      <div className="flex items-center space-x-1 text-xs">
        <Mic className="w-2.5 h-2.5 text-gray-500" />
        <span className="text-gray-600 text-xs">音声選択</span>
      </div>
    </div>
  );
}