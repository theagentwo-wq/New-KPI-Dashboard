import { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Icon } from './Icon';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface RichTextEditorHandle {
  insertImage: (dataUrl: string) => void;
  insertCheckbox: () => void;
  insertText: (text: string) => void;
  focus: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ content, onChange, placeholder = 'Type your note...', disabled = false, className = '' }, ref) => {
    const [fallbackContent, setFallbackContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Image.configure({
          inline: true,
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-md border-2 border-slate-600 my-2',
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-base text-white',
          style: 'min-height: 120px; -webkit-text-size-adjust: 100%; color: white; caret-color: white;',
        },
      },
    });

    // Update content when prop changes (important for clearing after save)
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    // Update disabled state
    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [disabled, editor]);

    // Update fallback content when content prop changes
    useEffect(() => {
      if (!editor && content) {
        // Strip HTML tags for fallback textarea
        const stripped = content.replace(/<[^>]*>/g, '');
        setFallbackContent(stripped);
      }
    }, [content, editor]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      insertImage: (dataUrl: string) => {
        if (editor) {
          editor.chain().focus().setImage({ src: dataUrl }).run();
        }
        // Fallback: ignore images in simple textarea mode
      },
      insertCheckbox: () => {
        if (editor) {
          editor.chain().focus().toggleTaskList().run();
        } else if (textareaRef.current) {
          // Fallback: insert checkbox character
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText = fallbackContent.substring(0, start) + '☐ ' + fallbackContent.substring(end);
          setFallbackContent(newText);
          onChange(`<p>${newText}</p>`);
        }
      },
      insertText: (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run();
        } else if (textareaRef.current) {
          // Fallback: insert text at cursor
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText = fallbackContent.substring(0, start) + text + fallbackContent.substring(end);
          setFallbackContent(newText);
          onChange(`<p>${newText}</p>`);
          // Set cursor after inserted text
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
          }, 0);
        }
      },
      focus: () => {
        if (editor) {
          editor.commands.focus();
        } else if (textareaRef.current) {
          textareaRef.current.focus();
        }
      },
    }));

    // If editor hasn't loaded, show fallback textarea
    if (!editor) {
      return (
        <div className={`bg-slate-800 border border-slate-700 rounded-md ${className}`}>
          <textarea
            ref={textareaRef}
            value={fallbackContent}
            onChange={(e) => {
              const text = e.target.value;
              setFallbackContent(text);
              onChange(`<p>${text}</p>`);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[120px] bg-slate-800 text-white text-base p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            style={{
              WebkitTextSizeAdjust: '100%',
              fontSize: '16px', // Prevents zoom on iOS
              caretColor: 'white',
            }}
          />
        </div>
      );
    }

    return (
      <>
        <style>{`
          .ProseMirror {
            min-height: 120px;
            padding: 12px;
            outline: none;
            color: white;
            caret-color: white;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #94a3b8;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
        <div className={`bg-slate-800 border border-slate-700 rounded-md ${className}`}>
          {/* Toolbar */}
        <div className="border-b border-slate-700 p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${
              editor.isActive('bold') ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Icon name="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${
              editor.isActive('italic') ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Icon name="italic" className="w-4 h-4" />
          </button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'
            }`}
            title="Bullet List"
          >
            <Icon name="list" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            disabled={disabled}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${
              editor.isActive('taskList') ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'
            }`}
            title="Task List (Checkboxes)"
          >
            <span className="text-base">☐</span>
          </button>
        </div>

        {/* Editor Content */}
        <div className="bg-slate-800 text-white" style={{
          minHeight: '120px',
          maxHeight: '300px',
          overflowY: 'auto',
          WebkitTextSizeAdjust: '100%'
        }}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
      </>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
