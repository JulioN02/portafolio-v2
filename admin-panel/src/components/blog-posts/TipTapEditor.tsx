import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        style: [
          'min-height: 400px',
          'padding: 1rem',
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
    label,
    title,
  }: {
    onClick: () => void;
    isActive: boolean;
    label: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#e6f7ff';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#f5f5f5';
        }
      }}
      style={{
        padding: '0.35rem 0.6rem',
        fontSize: '0.8125rem',
        fontWeight: isActive ? '600' : '400',
        background: isActive ? '#1677ff' : '#f5f5f5',
        color: isActive ? '#fff' : '#4a4a4a',
        border: '1px solid #e1e4e8',
        borderRadius: '4px',
        cursor: 'pointer',
        lineHeight: 1.4,
        transition: 'background 0.15s ease, color 0.15s ease',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );

  const Separator = () => (
    <div
      style={{
        width: '1px',
        alignSelf: 'stretch',
        background: '#e1e4e8',
        margin: '2px 4px',
      }}
    />
  );

  const handleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          flexWrap: 'wrap',
          padding: '0.5rem',
          background: '#fafafa',
          border: '1px solid #e1e4e8',
          borderRadius: '6px 6px 0 0',
          alignItems: 'center',
        }}
      >
        {/* Group 1 — Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label={<strong>B</strong>}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label={<em>I</em>}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          label={<span style={{ textDecoration: 'underline' }}>U</span>}
          title="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label={<span style={{ textDecoration: 'line-through' }}>S</span>}
          title="Strike"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          label={<span style={{ background: '#ffff00', padding: '0 2px' }}>Hl</span>}
          title="Highlight"
        />

        <Separator />

        {/* Group 2 — Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          label="H1"
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          label="H2"
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          label="H3"
          title="Heading 3"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          label="H4"
          title="Heading 4"
        />

        <Separator />

        {/* Group 3 — Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          label="L"
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          label="C"
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          label="R"
          title="Align Right"
        />

        <Separator />

        {/* Group 4 — Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label={'\u2022'}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="1."
          title="Ordered List"
        />

        <Separator />

        {/* Group 5 — Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          label={'\u201C'}
          title="Blockquote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          label="<>"
          title="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          label={'\u2014'}
          title="Horizontal Rule"
        />

        <Separator />

        {/* Group 6 — Links */}
        <ToolbarButton
          onClick={handleLink}
          isActive={editor.isActive('link')}
          label="Link"
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
        />
      </div>

      {/* ── Editor Content Area ── */}
      <div
        style={{
          border: '1px solid #e1e4e8',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          overflow: 'hidden',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
