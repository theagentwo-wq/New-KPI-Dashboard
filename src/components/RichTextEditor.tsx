import { useEffect, useImperativeHandle, forwardRef } from 'react';
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

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      insertImage: (dataUrl: string) => {
        if (editor) {
          editor.chain().focus().setImage({ src: dataUrl }).run();
        }
      },
      insertCheckbox: () => {
        if (editor) {
          editor.chain().focus().toggleTaskList().run();
        }
      },
      insertText: (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run();
        }
      },
      focus: () => {
        if (editor) {
          editor.commands.focus();
        }
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <>
        <style>{`
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #94a3b8;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
        <div className={`bg-slate-900 border border-slate-600 rounded-md ${className}`}>
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
        <div className="bg-slate-900 text-white min-h-[120px]" style={{
          WebkitTextSizeAdjust: '100%'
        }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      </>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
