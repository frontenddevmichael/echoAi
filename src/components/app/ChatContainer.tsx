// src/components/app/ChatContainer.tsx

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ChatArea } from './ChatArea';
import { CodeSandbox } from './CodeSandbox';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface CodeFile {
    id: string;
    filename: string;
    language: string;
    code: string;
    isGenerating?: boolean;
}

interface ChatContainerProps {
    messages: Message[];
    isLoading: boolean;
    onSuggestedPrompt?: (prompt: string) => void;
}

export function ChatContainer({ messages, isLoading, onSuggestedPrompt }: ChatContainerProps) {
    const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string>('');
    const [isSandboxVisible, setIsSandboxVisible] = useState(false);

    // Auto-detect code blocks in messages
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        // Only process assistant messages
        if (lastMessage.role !== 'assistant') return;

        const codeBlocks = parseCodeBlocks(lastMessage.content);

        if (Object.keys(codeBlocks).length > 0) {
            const files = createCodeFiles(codeBlocks);
            setCodeFiles(files);
            setActiveFileId(files[0]?.id || '');
            setIsSandboxVisible(true);

            // Simulate progressive generation completion
            const maxCodeLength = Math.max(...files.map(f => f.code.length));
            setTimeout(() => {
                setCodeFiles(prev => prev.map(file => ({
                    ...file,
                    isGenerating: false
                })));
            }, maxCodeLength * 10); // Adjust timing based on code length
        }
    }, [messages]);

    // Parse markdown code blocks
    const parseCodeBlocks = (content: string): Record<string, string> => {
        const codeBlocks: Record<string, string> = {};
        const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1].toLowerCase();
            const code = match[2].trim();

            // Support common web languages
            if (['html', 'css', 'javascript', 'js', 'jsx', 'tsx', 'typescript', 'ts'].includes(language)) {
                // Normalize js/javascript
                const normalizedLang = language === 'js' ? 'javascript' : language;
                codeBlocks[normalizedLang] = code;
            }
        }

        return codeBlocks;
    };

    // Create CodeFile objects from parsed code blocks
    const createCodeFiles = (codeBlocks: Record<string, string>): CodeFile[] => {
        const files: CodeFile[] = [];

        const fileConfigs: Record<string, { filename: string; id: string }> = {
            html: { filename: 'index.html', id: 'html' },
            css: { filename: 'style.css', id: 'css' },
            javascript: { filename: 'script.js', id: 'js' },
            jsx: { filename: 'App.jsx', id: 'jsx' },
            typescript: { filename: 'index.ts', id: 'ts' },
            tsx: { filename: 'App.tsx', id: 'tsx' },
        };

        Object.entries(codeBlocks).forEach(([lang, code]) => {
            const config = fileConfigs[lang];
            if (config) {
                files.push({
                    id: config.id,
                    filename: config.filename,
                    language: lang,
                    code: code,
                    isGenerating: true,
                });
            }
        });

        return files;
    };

    const handleCodeChange = (fileId: string, newCode: string) => {
        setCodeFiles(prev => prev.map(file =>
            file.id === fileId ? { ...file, code: newCode } : file
        ));
    };

    const handleCloseSandbox = () => {
        setIsSandboxVisible(false);
        // Optionally clear files when closing
        // setCodeFiles([]);
    };

    return (
        <div className="flex-1 overflow-hidden">
            {!isSandboxVisible || codeFiles.length === 0 ? (
                // Full width - no code sandbox
                <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    onSuggestedPrompt={onSuggestedPrompt}
                />
            ) : (
                // Split view with resizable panels
                <PanelGroup direction="horizontal">
                    {/* Chat Panel */}
                    <Panel defaultSize={60} minSize={35} maxSize={75}>
                        <ChatArea
                            messages={messages}
                            isLoading={isLoading}
                            onSuggestedPrompt={onSuggestedPrompt}
                        />
                    </Panel>

                    {/* Resize Handle */}
                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

                    {/* Code Sandbox Panel */}
                    <Panel defaultSize={40} minSize={25} maxSize={65}>
                        <div className="h-full overflow-hidden">
                            <CodeSandbox
                                files={codeFiles}
                                activeFileId={activeFileId}
                                onFileChange={setActiveFileId}
                                onCodeChange={handleCodeChange}
                                onClose={handleCloseSandbox}
                                isVisible={isSandboxVisible}
                                enablePreview={true}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            )}
        </div>
    );
}