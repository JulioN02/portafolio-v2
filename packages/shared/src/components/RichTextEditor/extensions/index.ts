import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { InlineImage } from './InlineImage';
import { InlineVideo } from './InlineVideo';
import { SimulatorPlaceholder } from './SimulatorPlaceholder';

export { InlineImage, InlineVideo, SimulatorPlaceholder };

/**
 * Single source of truth for the shared editor node set: every consumer
 * (Project/Product/Tool/Blog admin forms) gets the same extensions so stored
 * HTML stays stable across forms.
 */
export function buildEditorExtensions() {
  return [
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
    InlineImage,
    InlineVideo,
    SimulatorPlaceholder,
  ];
}