import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip, Smile, Mic, Zap, X, FileText, ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = ['image/*', 'application/pdf', '.txt', '.doc', '.docx'];
const DRAG_THRESHOLD = 60;
const DRAG_CONSTRAINT = 80;
const MAX_TEXTAREA_HEIGHT = 160;

// Comprehensive emoji dataset organized by category
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶'],
  'People': ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Nature': ['🌸', '💮', '🏵', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🐙', '🦪', '🐚', '🐌', '🦋', '🐛', '🐝', '🐞', '🦗', '🕷', '🦂', '🦟', '🦠'],
  'Food': ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
  'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '⛽', '🚧'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
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

interface VoiceSnippet {
  text: string;
  id: string;
  timestamp: number;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  onFileAttach,
  onVoiceTranscript,
  maxLength = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [voiceSnippets, setVoiceSnippets] = useState<VoiceSnippet[]>([]);
  const [recording, setRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Smileys');

  const templates = useMemo(
    () => ['Summarize the above', 'Translate to English', 'Give me key points', 'Explain like I\'m 5'],
    []
  );

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, DRAG_CONSTRAINT], [1, 0.6]);

  // Toast notification system
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error aborting recognition:', e);
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Click outside to close emoji picker and templates
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Check if click is outside emoji picker
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }

      // Check if click is outside templates
      if (
        showTemplates &&
        templatesRef.current &&
        !templatesRef.current.contains(event.target as Node)
      ) {
        setShowTemplates(false);
      }
    };

    // Add event listeners for both mouse and touch
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker, showTemplates]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading) return;

    // ALWAYS notify parent about files before submitting
    if (uploadedFiles.length > 0) {
      if (onFileAttach) {
        onFileAttach(uploadedFiles.map((f) => f.file));
      } else {
        // If no handler, log warning
        console.warn('Files attached but no onFileAttach handler provided');
      }
    }

    // Call onSubmit to send the message
    onSubmit();

    // Clear after submission
    setUploadedFiles([]);
    setVoiceSnippets([]);
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

  // File validation
  const validateFile = useCallback(
    (file: File): string | null => {
      if (uploadedFiles.length >= MAX_FILES) {
        return `Maximum ${MAX_FILES} files allowed`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `File ${file.name} exceeds 10MB limit`;
      }
      return null;
    },
    [uploadedFiles.length]
  );

  // Handle file upload
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: UploadedFile[] = [];

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          showToast(error, 'error');
          continue;
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          id: `${Date.now()}-${Math.random()}`,
          size: file.size,
          type: file.type,
          file,
        };
        validFiles.push(uploadedFile);
      }

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
        showToast(`${validFiles.length} file(s) attached`, 'success');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [validateFile, showToast]
  );

  // Voice recording with proper transcript handling
  const toggleVoiceRecording = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Voice input not supported in this browser. Try Chrome or Edge.', 'error');
      return;
    }

    if (!recording) {
      try {
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('🎤 Voice recognition started');
          setRecording(true);
          showToast('🎤 Listening... Speak now!', 'info');
        };

        recognition.onresult = (event: any) => {
          console.log('📝 Voice recognition result received:', event);

          if (event.results && event.results.length > 0) {
            const result = event.results[0][0];
            const transcript = result.transcript;
            const confidence = result.confidence;

            console.log('✅ Transcript:', transcript);
            console.log('📊 Confidence:', confidence);

            // Create snippet
            const snippet: VoiceSnippet = {
              text: transcript,
              id: Date.now().toString(),
              timestamp: Date.now(),
            };

            setVoiceSnippets((prev) => [...prev, snippet]);

            // Insert transcript into textarea - IMPORTANT: This is what shows the text
            const currentValue = textareaRef.current?.value || value;
            const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
            console.log('📝 New value:', newValue);
            onChange(newValue);

            // Notify parent if handler exists
            if (onVoiceTranscript) {
              onVoiceTranscript(transcript);
            }

            showToast(`✅ Voice input added: "${transcript.substring(0, 30)}..."`, 'success');

            // Focus back on textarea
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 100);
          } else {
            console.warn('⚠️ No results in event');
          }
        };

        recognition.onerror = (event: any) => {
          console.error('❌ Voice recognition error:', event.error, event);
          let errorMessage = 'Voice input error';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again and speak clearly.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone found. Please check your device settings.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access.';
              break;
            case 'network':
              errorMessage = 'Network error occurred. Check your connection.';
              break;
            case 'aborted':
              errorMessage = 'Voice input cancelled.';
              break;
            default:
              errorMessage = `Voice input error: ${event.error}`;
          }

          showToast(errorMessage, 'error');
          setRecording(false);
        };

        recognition.onend = () => {
          console.log('🛑 Voice recognition ended');
          setRecording(false);
        };

        console.log('🚀 Starting voice recognition...');
        recognition.start();
        recognitionRef.current = recognition;

      } catch (error) {
        console.error('💥 Failed to start voice recording:', error);
        showToast('Failed to start voice recording. Please try again.', 'error');
        setRecording(false);
      }
    } else {
      console.log('⏹️ Stopping voice recognition...');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecording(false);
    }
  }, [recording, value, onChange, onVoiceTranscript, showToast]);

  // Insert emoji
  const insertEmoji = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + emoji + value.slice(end);

      onChange(newValue);

      // Focus and set cursor position
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

  // Remove handlers
  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const removeVoice = useCallback((id: string) => {
    setVoiceSnippets((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 100;

  return (
    <>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium',
                toast.type === 'error' && 'bg-red-500 text-white',
                toast.type === 'success' && 'bg-green-500 text-white',
                toast.type === 'info' && 'bg-blue-500 text-white'
              )}
            >
              {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 py-4 z-40">
        <motion.div
          className="flex flex-col gap-2 rounded-2xl border bg-background p-2 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20"
          style={{ x, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: DRAG_CONSTRAINT }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.point.x > DRAG_THRESHOLD && value.trim()) {
              handleSubmit();
            }
          }}
        >
          {/* File attachments */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              <AnimatePresence>
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs border border-blue-200 dark:border-blue-800"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-900 dark:text-blue-100">{file.name}</span>
                      <span className="text-blue-600 dark:text-blue-400">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900 rounded transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Voice snippets */}
          {voiceSnippets.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              <AnimatePresence>
                {voiceSnippets.map((snippet) => (
                  <motion.div
                    key={snippet.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-xs border border-purple-200 dark:border-purple-800"
                  >
                    <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-purple-900 dark:text-purple-100 max-w-[200px] truncate">
                      {snippet.text}
                    </span>
                    <button
                      onClick={() => removeVoice(snippet.id)}
                      className="ml-1 p-0.5 hover:bg-purple-200 dark:hover:bg-purple-900 rounded transition-colors"
                      aria-label="Remove voice snippet"
                    >
                      <X className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Main input area */}
          <div className="flex items-end gap-2">
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
              className="flex-1 w-full resize-none border-0 bg-transparent py-2.5 px-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 min-h-[40px]"
              aria-label="Chat message input"
              style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
            />

            {/* Toolbar */}
            <div className="flex gap-1 items-center pb-1">
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload files"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedFiles.length >= MAX_FILES}
                aria-label="Attach files"
                className="h-8 w-8"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* Emoji picker */}
              <div className="relative">
                <Button
                  ref={emojiButtonRef}
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Insert emoji"
                  className="h-8 w-8"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                {showEmojiPicker && (
                  <motion.div
                    ref={emojiPickerRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border w-80 max-h-96 overflow-hidden flex flex-col"
                  >
                    {/* Header with close button */}
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Emojis
                      </span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Close emoji picker"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-1 p-2 border-b overflow-x-auto">
                      {Object.keys(EMOJI_CATEGORIES).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                            selectedCategory === category
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Emoji grid */}
                    <div className="p-3 overflow-y-auto grid grid-cols-8 gap-1">
                      {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                          aria-label={`Insert ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Voice input */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleVoiceRecording}
                className={cn('h-8 w-8', recording && 'bg-red-500/10 animate-pulse')}
                aria-label={recording ? 'Stop recording' : 'Start voice input'}
              >
                <Mic className={cn('w-4 h-4', recording && 'text-red-500')} />
              </Button>

              {/* Templates */}
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowTemplates(!showTemplates)}
                  aria-label="Quick templates"
                  className="h-8 w-8"
                >
                  <Zap className="w-4 h-4" />
                </Button>
                {showTemplates && (
                  <motion.div
                    ref={templatesRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border min-w-[200px] overflow-hidden"
                  >
                    {/* Header with close button */}
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Templates
                      </span>
                      <button
                        onClick={() => setShowTemplates(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Close templates"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Template list */}
                    <div className="p-2">
                      {templates.map((template) => (
                        <button
                          key={template}
                          onClick={() => insertTemplate(template)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Send button */}
              <Button
                variant={value.trim() ? 'default' : 'ghost'}
                size="icon"
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                aria-label={isLoading ? 'Sending...' : 'Send message'}
                className="h-8 w-8"
              >
                {isLoading ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Character counter */}
          {isNearLimit && (
            <div className="px-3 pb-1">
              <span className={cn('text-xs', remainingChars < 50 ? 'text-red-500' : 'text-yellow-600')}>
                {remainingChars} characters remaining
              </span>
            </div>
          )}
        </motion.div>

        {/* Drag hint */}
        {value.trim() && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-xs text-center text-muted-foreground mt-2"
          >
            Swipe right to send →
          </motion.p>
        )}
      </div>
    </>
  );
}