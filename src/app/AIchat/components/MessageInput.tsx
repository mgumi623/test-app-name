import { useEffect, useRef, useState } from 'react';
import { Send, Mic, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AudioUpload from './AudioUpload';
import ImageUpload from './ImageUpload';
import { ModeType } from './Header';

interface MessageInputProps {
  inputText: string;
  isTyping: boolean;
  selectedMode: ModeType;
  selectedAudioFile: File | null;
  selectedImageFile: File | null;
  onInputChange: (value: string) => void;
  onSendMessage: (audioFile?: File, imageFile?: File) => Promise<void>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
  onAudioFileSelect: (file: File) => void;
  onImageFileSelect: (file: File) => void;
  onAudioFileRemove: () => void;
  onImageFileRemove: () => void;
}

export default function MessageInput({
  inputText,
  isTyping,
  selectedMode,
  selectedAudioFile,
  selectedImageFile,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onAudioFileSelect,
  onImageFileSelect,
  onAudioFileRemove,
  onImageFileRemove,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const isMinutesMode = selectedMode === '議事録作成';

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  const handleSend = async () => {
    console.log('[MessageInput] handleSend called:', {
      hasText: !!inputText.trim(),
      hasAudioFile: !!selectedAudioFile,
      hasImageFile: !!selectedImageFile,
      audioFileName: selectedAudioFile?.name,
      imageFileName: selectedImageFile?.name,
      selectedMode
    });
    
    // 画像ファイルが選択されている場合の追加ログ
    if (selectedImageFile) {
      console.log('[MessageInput] Sending image file:', {
        name: selectedImageFile.name,
        size: selectedImageFile.size,
        type: selectedImageFile.type,
        lastModified: selectedImageFile.lastModified
      });
    }
    
    await onSendMessage(selectedAudioFile || undefined, selectedImageFile || undefined);
  };

  const handleAudioFileSelectWrapper = (file: File) => {
    onAudioFileSelect(file);
    setShowAudioUpload(false);
  };

  const handleImageFileSelectWrapper = (file: File) => {
    console.log('[MessageInput] handleImageFileSelectWrapper called with file:', file.name);
    try {
      // ファイルの詳細情報をログ出力
      console.log('[MessageInput] Image file details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      onImageFileSelect(file);
      setShowImageUpload(false);
      console.log('[MessageInput] Image file successfully selected and processed');
    } catch (error) {
      console.error('[MessageInput] Error in handleImageFileSelectWrapper:', error);
    }
  };

  const handleImageButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[MessageInput] Image button clicked, opening file dialog directly');
    console.log('[MessageInput] Event details:', { type: e.type, target: e.target });
    
    // 方法1: 直接ファイル選択ダイアログを開く
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      input.style.display = 'none';
      
      // DOMに追加してからクリック
      document.body.appendChild(input);
      
      input.onchange = (changeEvent) => {
        const file = (changeEvent.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('[MessageInput] Image file selected:', file.name, 'Size:', file.size, 'Type:', file.type);
          handleImageFileSelectWrapper(file);
        } else {
          console.log('[MessageInput] No file selected');
        }
        // クリーンアップ
        document.body.removeChild(input);
      };
      
      input.onerror = (errorEvent) => {
        console.error('[MessageInput] File input error:', errorEvent);
        document.body.removeChild(input);
      };
      
      // ファイル選択ダイアログを開く
      input.click();
      console.log('[MessageInput] File dialog opened');
    } catch (error) {
      console.error('[MessageInput] Error opening file dialog:', error);
      
      // 方法2: ポップアップを表示（フォールバック）
      console.log('[MessageInput] Falling back to popup method');
      setShowImageUpload(!showImageUpload);
    }
  };

  return (
    <div className="bg-transparent p-1.5 sm:p-2 w-full relative">
      <div className="max-w-4xl mx-auto">
        {(() => {
          console.log('[MessageInput] Rendering component, selectedMode:', selectedMode, 'isMinutesMode:', isMinutesMode, 'selectedImageFile:', selectedImageFile?.name, 'inputText:', inputText.trim());
          return null;
        })()}
        {/* メッセージ入力エリア */}
        <div className="flex items-end space-x-3 bg-white/70 border border-gray-300 rounded-2xl p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 focus-within:shadow-md transition-all duration-200 ease-in-out">
          {/* 音声ファイル添付ボタン（議事録作成モードの場合のみ表示） */}
          {isMinutesMode && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAudioUpload(!showAudioUpload)}
              className="rounded-xl touch-manipulation hover:bg-blue-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200"
              style={{ 
                minHeight: '44px', 
                minWidth: '44px',
                WebkitTapHighlightColor: 'transparent'
              }}
              disabled={isTyping}
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}

          {/* 画像ファイル添付ボタン（通常モードの場合のみ表示） */}
          {selectedMode === '通常' && (
            <>
              {console.log('[MessageInput] Rendering image button, selectedMode:', selectedMode, 'isTyping:', isTyping)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageButtonClick}
                className="rounded-xl touch-manipulation hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200"
                style={{ 
                  minHeight: '44px', 
                  minWidth: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: isTyping ? 'not-allowed' : 'pointer'
                }}
                disabled={isTyping}
                title="画像を選択"
              >
                <Image className="w-5 h-5" />
              </Button>
              
              {/* 隠しファイル入力（フォールバック用） */}
              <input
                type="file"
                accept="image/*"
                multiple={false}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('[MessageInput] Hidden input file selected:', file.name);
                    handleImageFileSelectWrapper(file);
                  }
                }}
                style={{ display: 'none' }}
                id="hidden-image-input"
              />
            </>
          )}
          
          <Textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isMinutesMode 
                ? "音声ファイルをアップロードするか、メッセージを入力してください..." 
                : "メッセージを入力してください..."
            }
            className="flex-1 resize-none min-h-[44px] max-h-32 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-gray-500"
          />
                    <Button
            onClick={handleSend}
            disabled={
              (() => {
                const isDisabled = isTyping || (isMinutesMode ? !selectedAudioFile : (!inputText.trim() && !selectedImageFile));
                console.log('[MessageInput] Send button disabled state:', {
                  isTyping,
                  isMinutesMode,
                  hasAudioFile: !!selectedAudioFile,
                  hasText: !!inputText.trim(),
                  hasImageFile: !!selectedImageFile,
                  isDisabled
                });
                return isDisabled;
              })()
            }
            size="icon"
            className="rounded-xl touch-manipulation hover:bg-blue-600 focus:bg-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              WebkitTapHighlightColor: 'transparent'
            }}
            title={`Send button state: isTyping=${isTyping}, hasText=${!!inputText.trim()}, hasImage=${!!selectedImageFile}, disabled=${isTyping || (isMinutesMode ? !selectedAudioFile : (!inputText.trim() && !selectedImageFile))}`}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* 選択された音声ファイル表示 */}
        {isMinutesMode && selectedAudioFile && (
          <div className="mt-1 px-2">
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs">
              <Mic className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
              <span className="text-blue-800 truncate flex-1 text-xs">{selectedAudioFile.name}</span>
              <button
                type="button"
                onClick={onAudioFileRemove}
                className="w-3 h-3 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                disabled={isTyping}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 選択された画像ファイル表示 */}
        {selectedMode === '通常' && selectedImageFile && (
          <>
            {console.log('[MessageInput] Rendering selected image file:', selectedImageFile.name)}
          <div className="mt-1 px-2">
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded text-xs">
              <Image className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 truncate flex-1 text-xs">{selectedImageFile.name}</span>
              <button
                type="button"
                onClick={onImageFileRemove}
                className="w-3 h-3 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                disabled={isTyping}
              >
                ×
              </button>
            </div>
          </div>
          </>
        )}

        {/* 音声アップロードポップアップ */}
        {isMinutesMode && showAudioUpload && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-10">
            <div className="max-w-4xl mx-auto px-2">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <AudioUpload
                  onFileSelect={handleAudioFileSelectWrapper}
                  onFileRemove={onAudioFileRemove}
                  selectedFile={selectedAudioFile}
                  disabled={isTyping}
                />
              </div>
            </div>
          </div>
        )}

        {/* 画像アップロードポップアップ */}
        {selectedMode === '通常' && showImageUpload && (
          <>
            {console.log('[MessageInput] Rendering image upload popup, showImageUpload:', showImageUpload)}
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
            <div className="max-w-4xl mx-auto px-2">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="mb-2 text-sm font-medium text-gray-700">画像を選択してください</div>
                <ImageUpload
                  onFileSelect={handleImageFileSelectWrapper}
                  onFileRemove={onImageFileRemove}
                  selectedFile={selectedImageFile}
                  disabled={isTyping}
                />
                <div className="mt-2 text-xs text-gray-500">
                  対応形式: JPG, PNG, GIF, WebP, BMP, TIFF
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}