import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip, Smile, Mic, Zap, X, FileText, ImageIcon, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = ['image/*', 'application/pdf', '.txt', '.doc', '.docx'];
const MAX_TEXTAREA_HEIGHT = 160;
const MIN_TEXTAREA_HEIGHT = 44;

// Simplified emoji set for mobile performance
const EMOJI_QUICK = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💡', '🚀', '💯', '🤔', '👀'];

const EMOJI_CATEGORIES = {
  'Recent': EMOJI_QUICK,
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '🤔', '🤨', '😐', '🙄', '😬', '😌', '😴', '🤯', '😎', '🤓', '🥳'],
  'Gestures': ['👋', '👌', '✌️', '🤞', '🤟', '🤘', '👍', '👎', '👏', '🙌', '🤝', '🙏', '💪'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💗', '💖', '💘', '💝'],
  'Objects': ['💡', '🔥', '✨', '⭐', '🎉', '🎊', '🚀', '💻', '📱', '⚡', '💯', '✅', '❌'],
};

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onFileAttach?: (files: File[]) => void;
  onVoiceTranscript?: (text: string) => void;
  maxLength?: number;
}

interface UploadedFile {
  name: string;
  id: string;
  size: number;
  type: string;
  file: File;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  onFileAttach,
  maxLength = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [recording, setRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Recent');
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const templates = useMemo(
    () => ['Summarize the above', 'Translate to English', 'Explain like I\'m 5', 'Give me key points'],
    []
  );

  // Detect virtual keyboard
  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const heightDiff = window.innerHeight - viewport.height;
        setKeyboardVisible(heightDiff > 150);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
      if (showTemplates && templatesRef.current && !templatesRef.current.contains(target)) {
        setShowTemplates(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker, showTemplates]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading) return;

    if (uploadedFiles.length > 0 && onFileAttach) {
      onFileAttach(uploadedFiles.map((f) => f.file));
    }

    onSubmit();
    setUploadedFiles([]);
    setShowEmojiPicker(false);
    setShowTemplates(false);
    setIsToolbarExpanded(false);
  }, [value, isLoading, onSubmit, uploadedFiles, onFileAttach]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowTemplates(false);
      }
    },
    [handleSubmit]
  );

  // File validation and upload
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: UploadedFile[] = [];

      for (const file of files) {
        if (uploadedFiles.length + validFiles.length >= MAX_FILES) break;
        if (file.size > MAX_FILE_SIZE) continue;

        validFiles.push({
          name: file.name,
          id: `${Date.now()}-${Math.random()}`,
          size: file.size,
          type: file.type,
          file,
        });
      }

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadedFiles.length]
  );

  // Voice recording (simplified for reliability)
  const toggleVoiceRecording = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser');
      return;
    }

    if (recording) {
      setRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(value ? `${value} ${transcript}` : transcript);
        textareaRef.current?.focus();
      };

      recognition.onerror = () => setRecording(false);
      recognition.onend = () => setRecording(false);

      recognition.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }, [recording, value, onChange]);

  // Insert emoji
  const insertEmoji = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(value + emoji);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + emoji + value.slice(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const newCursorPos = start + emoji.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange]
  );

  // Insert template
  const insertTemplate = useCallback(
    (template: string) => {
      onChange(value + (value ? '\n\n' : '') + template);
      setShowTemplates(false);
      textareaRef.current?.focus();
    },
    [value, onChange]
  );

  // Remove file
  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 100;
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div 
      ref={containerRef}
      className="w-full bg-background safe-area-bottom"
    >
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 sm:p-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-foreground/20">
          
          {/* File attachments */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 px-1"
              >
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-lg text-xs max-w-[140px] sm:max-w-[200px]"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-foreground">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-0.5 hover:bg-muted-foreground/20 rounded flex-shrink-0 touch-manipulation"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input row */}
          <div className="flex items-end gap-1.5 sm:gap-2">
            {/* Mobile toolbar toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              className="h-10 w-10 sm:hidden flex-shrink-0 touch-manipulation"
              aria-label="Toggle toolbar"
            >
              <ChevronUp className={cn("w-5 h-5 transition-transform", isToolbarExpanded && "rotate-180")} />
            </Button>

            {/* Textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    onChange(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                maxLength={maxLength}
                className={cn(
                  "w-full resize-none bg-transparent text-sm sm:text-base leading-relaxed",
                  "placeholder:text-muted-foreground/50 focus:outline-none",
                  "py-2.5 px-1 min-h-[44px]"
                )}
                style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
                aria-label="Message input"
              />
            </div>

            {/* Desktop toolbar */}
            <div className="hidden sm:flex items-center gap-1">
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedFiles.length >= MAX_FILES}
                className="h-9 w-9"
                aria-label="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* Emoji picker */}
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowTemplates(false);
                  }}
                  className="h-9 w-9"
                  aria-label="Insert emoji"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      ref={emojiPickerRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 right-0 bg-popover border border-border rounded-xl shadow-lg w-72 max-h-80 overflow-hidden z-50"
                    >
                      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-hide">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                              selectedCategory === category
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 overflow-y-auto max-h-48 grid grid-cols-8 gap-1">
                        {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="text-xl hover:bg-muted rounded p-1.5 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Voice input */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleVoiceRecording}
                className={cn('h-9 w-9', recording && 'bg-destructive/10 text-destructive')}
                aria-label={recording ? 'Stop recording' : 'Start voice input'}
              >
                <Mic className={cn('w-4 h-4', recording && 'animate-pulse')} />
              </Button>

              {/* Templates */}
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setShowTemplates(!showTemplates);
                    setShowEmojiPicker(false);
                  }}
                  className="h-9 w-9"
                  aria-label="Quick templates"
                >
                  <Zap className="w-4 h-4" />
                </Button>
                
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div
                      ref={templatesRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 right-0 bg-popover border border-border rounded-xl shadow-lg min-w-[180px] overflow-hidden z-50"
                    >
                      <div className="p-1">
                        {templates.map((template) => (
                          <button
                            key={template}
                            onClick={() => insertTemplate(template)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Send button */}
            <Button
              variant={canSend ? 'default' : 'ghost'}
              size="icon"
              onClick={handleSubmit}
              disabled={!canSend}
              className="h-10 w-10 sm:h-9 sm:w-9 flex-shrink-0 touch-manipulation"
              aria-label={isLoading ? 'Sending...' : 'Send message'}
            >
              {isLoading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Mobile expanded toolbar */}
          <AnimatePresence>
            {isToolbarExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden border-t border-border pt-2 mt-1"
              >
                <div className="flex items-center justify-around">
                  {/* File upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadedFiles.length >= MAX_FILES}
                    className="h-11 w-11 touch-manipulation"
                    aria-label="Attach files"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>

                  {/* Emoji picker */}
                  <div className="relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowTemplates(false);
                      }}
                      className="h-11 w-11 touch-manipulation"
                      aria-label="Insert emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Voice input */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleVoiceRecording}
                    className={cn('h-11 w-11 touch-manipulation', recording && 'bg-destructive/10 text-destructive')}
                    aria-label={recording ? 'Stop recording' : 'Start voice input'}
                  >
                    <Mic className={cn('w-5 h-5', recording && 'animate-pulse')} />
                  </Button>

                  {/* Templates */}
                  <div className="relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowTemplates(!showTemplates);
                        setShowEmojiPicker(false);
                      }}
                      className="h-11 w-11 touch-manipulation"
                      aria-label="Quick templates"
                    >
                      <Zap className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile emoji quick picks */}
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-border"
                  >
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                      {Object.keys(EMOJI_CATEGORIES).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                            selectedCategory === category
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                      {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="text-2xl p-2 hover:bg-muted rounded transition-colors touch-manipulation"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Mobile templates */}
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-border"
                  >
                    <div className="flex flex-wrap gap-2">
                      {templates.map((template) => (
                        <button
                          key={template}
                          onClick={() => insertTemplate(template)}
                          className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors touch-manipulation"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character counter */}
          <AnimatePresence>
            {isNearLimit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-1"
              >
                <span className={cn(
                  'text-xs',
                  remainingChars < 50 ? 'text-destructive' : 'text-amber-500'
                )}>
                  {remainingChars} characters remaining
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
