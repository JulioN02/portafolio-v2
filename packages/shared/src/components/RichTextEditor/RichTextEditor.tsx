import { useEditor, EditorContent } from '@tiptap/react';
import { useState, type ReactNode } from 'react';
import { buildEditorExtensions } from './extensions';
import { SimulatorPicker, type SimulatorPickerApi, type SimulatorPickerLabels } from './SimulatorPicker';

/** User-facing labels for the toolbar and insert dialogs (es/en). */
export interface RichTextEditorLabels {
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  highlight: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  bulletList: string;
  orderedList: string;
  blockquote: string;
  code: string;
  codeBlock: string;
  horizontalRule: string;
  addLink: string;
  removeLink: string;
  insertImage: string;
  insertVideo: string;
  insertSimulator: string;
  imageUrlPrompt: string;
  videoUrlPrompt: string;
  simulatorIdPrompt: string;
  simulatorPicker: SimulatorPickerLabels;
}

const ES_LABELS: RichTextEditorLabels = {
  bold: 'Negrita',
  italic: 'Cursiva',
  underline: 'Subrayado',
  strike: 'Tachado',
  highlight: 'Resaltado',
  heading1: 'Encabezado 1',
  heading2: 'Encabezado 2',
  heading3: 'Encabezado 3',
  heading4: 'Encabezado 4',
  alignLeft: 'Alinear a la izquierda',
  alignCenter: 'Alinear al centro',
  alignRight: 'Alinear a la derecha',
  bulletList: 'Lista con viñetas',
  orderedList: 'Lista numerada',
  blockquote: 'Cita',
  code: 'Código en línea (Ctrl+E)',
  codeBlock: 'Bloque de código',
  horizontalRule: 'Línea horizontal',
  addLink: 'Agregar enlace',
  removeLink: 'Quitar enlace',
  insertImage: 'Insertar imagen',
  insertVideo: 'Insertar video',
  insertSimulator: 'Insertar simulador',
  imageUrlPrompt: 'URL de la imagen:',
  videoUrlPrompt: 'URL del video:',
  simulatorIdPrompt: 'ID del simulador:',
  simulatorPicker: {
    title: 'Insertar simulador',
    listTitle: 'Simuladores existentes',
    empty: 'Aún no hay simuladores. Sube uno abajo.',
    loading: 'Cargando simuladores...',
    error: 'No se pudieron cargar los simuladores. Intenta de nuevo.',
    uploadTitle: 'Subir nuevo simulador',
    titleLabel: 'Título',
    titlePlaceholder: 'Nombre del simulador',
    fileLabel: 'Archivo HTML (.html, máx. 1MB)',
    invalidFile: 'El archivo debe ser .html y pesar menos de 1MB.',
    insert: 'Insertar',
    upload: 'Subir e insertar',
    uploading: 'Subiendo...',
  },
};

const EN_LABELS: RichTextEditorLabels = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strike',
  highlight: 'Highlight',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  heading4: 'Heading 4',
  alignLeft: 'Align Left',
  alignCenter: 'Align Center',
  alignRight: 'Align Right',
  bulletList: 'Bullet List',
  orderedList: 'Ordered List',
  blockquote: 'Blockquote',
  code: 'Inline Code (Ctrl+E)',
  codeBlock: 'Code Block',
  horizontalRule: 'Horizontal Rule',
  addLink: 'Add Link',
  removeLink: 'Remove Link',
  insertImage: 'Insert Image',
  insertVideo: 'Insert Video',
  insertSimulator: 'Insert Simulator',
  imageUrlPrompt: 'Image URL:',
  videoUrlPrompt: 'Video URL:',
  simulatorIdPrompt: 'Simulator ID:',
  simulatorPicker: {
    title: 'Insert Simulator',
    listTitle: 'Existing simulators',
    empty: 'No simulators yet. Upload one below.',
    loading: 'Loading simulators...',
    error: 'Could not load simulators. Try again.',
    uploadTitle: 'Upload new simulator',
    titleLabel: 'Title',
    titlePlaceholder: 'Simulator name',
    fileLabel: 'HTML file (.html, max 1MB)',
    invalidFile: 'The file must be .html and under 1MB.',
    insert: 'Insert',
    upload: 'Upload and insert',
    uploading: 'Uploading...',
  },
};

export interface RichTextEditorProps {
  /** Initial HTML content. The editor parses it once on mount. */
  value: string;
  /** Called with serialized HTML (TipTap getHTML) on every change. */
  onChange: (html: string) => void;
  /** Minimum height of the editable area in px. Default 400. */
  minHeight?: number;
  /** Toolbar and insert-dialog language. Default 'es'. */
  lang?: 'es' | 'en';
  /** Partial label overrides (highest priority). */
  labels?: Partial<RichTextEditorLabels>;
  /**
   * Optional simulator data source. When provided, "Insertar simulador" opens
   * the picker (list + upload); otherwise it falls back to a manual ID prompt.
   */
  simulatorApi?: SimulatorPickerApi;
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = 400,
  lang = 'es',
  labels: labelOverrides,
  simulatorApi,
}: RichTextEditorProps) {
  const labels: RichTextEditorLabels = {
    ...(lang === 'en' ? EN_LABELS : ES_LABELS),
    ...labelOverrides,
  };
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: buildEditorExtensions(),
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: [
          `min-height: ${minHeight}px`,
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
    label: ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`rte-toolbar-button${isActive ? ' rte-toolbar-button--active' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {label}
    </button>
  );

  const Separator = () => <div className="rte-toolbar-separator" aria-hidden="true" />;

  const handleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt(labels.addLink);
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt(labels.imageUrlPrompt);
    if (url) {
      editor
        .chain()
        .focus()
        .insertContent({ type: 'inlineImage', attrs: { src: url, alt: '' } })
        .run();
    }
  };

  const handleInsertVideo = () => {
    const url = window.prompt(labels.videoUrlPrompt);
    if (url) {
      editor.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run();
    }
  };

  const handleInsertSimulator = () => {
    // Phase 4: with a simulator data source, open the picker (list + upload);
    // without one, fall back to a manual ID prompt (previous behavior).
    if (simulatorApi) {
      setPickerOpen(true);
      return;
    }
    const id = window.prompt(labels.simulatorIdPrompt);
    editor
      .chain()
      .focus()
      .insertContent({ type: 'simulatorPlaceholder', attrs: { simulatorId: id ?? '' } })
      .run();
  };

  return (
    <div className="rte-shell">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar">
        {/* Group 1 — Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label={<strong>B</strong>}
          title={labels.bold}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label={<em>I</em>}
          title={labels.italic}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          label={<span style={{ textDecoration: 'underline' }}>U</span>}
          title={labels.underline}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label={<span style={{ textDecoration: 'line-through' }}>S</span>}
          title={labels.strike}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          label={<span style={{ background: '#ffff00', padding: '0 2px' }}>Hl</span>}
          title={labels.highlight}
        />

        <Separator />

        {/* Group 2 — Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          label="H1"
          title={labels.heading1}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          label="H2"
          title={labels.heading2}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          label="H3"
          title={labels.heading3}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          label="H4"
          title={labels.heading4}
        />

        <Separator />

        {/* Group 3 — Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          label="L"
          title={labels.alignLeft}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          label="C"
          title={labels.alignCenter}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          label="R"
          title={labels.alignRight}
        />

        <Separator />

        {/* Group 4 — Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label={'\u2022'}
          title={labels.bulletList}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="1."
          title={labels.orderedList}
        />

        <Separator />

        {/* Group 5 — Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          label={'\u201C'}
          title={labels.blockquote}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          label={'</>'}
          title={labels.code}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          label="<>"
          title={labels.codeBlock}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          label={'\u2014'}
          title={labels.horizontalRule}
        />

        <Separator />

        {/* Group 6 — Links */}
        <ToolbarButton
          onClick={handleLink}
          isActive={editor.isActive('link')}
          label="Link"
          title={editor.isActive('link') ? labels.removeLink : labels.addLink}
        />

        <Separator />

        {/* Group 7 — Inline Media + Simulator placeholder */}
        <ToolbarButton
          onClick={handleInsertImage}
          isActive={false}
          label={labels.insertImage}
          title={labels.insertImage}
        />
        <ToolbarButton
          onClick={handleInsertVideo}
          isActive={false}
          label={labels.insertVideo}
          title={labels.insertVideo}
        />
        <ToolbarButton
          onClick={handleInsertSimulator}
          isActive={false}
          label={labels.insertSimulator}
          title={labels.insertSimulator}
        />
      </div>

      {/* ── Editor Content Area ── */}
      <div className="rte-editor-shell">
        <EditorContent editor={editor} />
      </div>

      {/* ── Simulator picker (Phase 4) ── */}
      {simulatorApi && (
        <SimulatorPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          api={simulatorApi}
          labels={labels.simulatorPicker}
          onSelect={(simulatorId) => {
            editor
              .chain()
              .focus()
              .insertContent({ type: 'simulatorPlaceholder', attrs: { simulatorId } })
              .run();
          }}
        />
      )}
    </div>
  );
}