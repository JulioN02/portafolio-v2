import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        style: [
          'min-height: 300px',
          'padding: 1rem',
          'border: 1px solid #d1d5db',
          'border-radius: 4px',
          'font-size: 1rem',
          'line-height: 1.6',
          'outline: none',
          'background: #fff',
        ].join('; '),
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    label 
  }: { 
    onClick: () => void; 
    isActive: boolean; 
    label: string;
  }) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: '0.25rem 0.5rem',
        background: isActive ? '#3b82f6' : '#f3f4f6',
        color: isActive ? '#fff' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '400',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label="Strike"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          label="H1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          label="H3"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label="• List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="1. List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          label="Code"
        />
      </div>

      {/* Editor */}
      <div style={{ position: 'relative' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}