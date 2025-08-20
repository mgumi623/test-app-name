import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative inline-block">
      <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-2 max-w-xs">
        <div className="flex items-start space-x-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded border"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
