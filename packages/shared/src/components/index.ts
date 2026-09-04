// UI Components
export { Button } from './ui/Button/index.js';
export type { ButtonProps, ButtonVariant, ButtonSize } from './ui/Button/index.js';

export { Input } from './ui/Input/index.js';
export type { InputProps } from './ui/Input/index.js';

export { Card } from './ui/Card/index.js';
export type { CardProps } from './ui/Card/index.js';

export { Badge } from './ui/Badge/index.js';
export type { BadgeProps } from './ui/Badge/index.js';

export { Loading } from './ui/Loading/index.js';
export type { LoadingProps } from './ui/Loading/index.js';

export { ErrorMessage } from './ui/ErrorMessage/index.js';
export type { ErrorMessageProps } from './ui/ErrorMessage/index.js';

export { Modal } from './ui/Modal/index.js';
export type { ModalProps } from './ui/Modal/index.js';

export { Textarea } from './ui/Textarea/index.js';
export type { TextareaProps } from './ui/Textarea/index.js';

export { Select } from './ui/Select/index.js';
export type { SelectProps } from './ui/Select/index.js';

export { Checkbox } from './ui/Checkbox/index.js';
export type { CheckboxProps } from './ui/Checkbox/index.js';

// Auth Components
export { ProtectedRoute } from './auth/ProtectedRoute.js';
export type { ProtectedRouteProps } from './auth/ProtectedRoute.js';

// Error Boundary
export { ErrorBoundary } from './ui/ErrorBoundary/index.js';
export type { ErrorBoundaryProps } from './ui/ErrorBoundary/index.js';
export { ErrorFallback } from './ui/ErrorBoundary/index.js';
export type { ErrorFallbackProps } from './ui/ErrorBoundary/index.js';
export { withBoundary } from './ui/ErrorBoundary/index.js';

// Rich Text Editor
export { RichTextEditor } from './RichTextEditor/index.js';
export type { RichTextEditorProps, RichTextEditorLabels } from './RichTextEditor/index.js';
export { SimulatorPicker, SIMULATOR_PICKER_MAX_SIZE } from './RichTextEditor/index.js';
export type {
  SimulatorPickerApi,
  SimulatorOption,
  SimulatorPickerLabels,
} from './RichTextEditor/index.js';
export {
  SimulatorNode,
  SimulatorSection,
  renderSimulatorEmbeds,
  buildSimulatorSrc,
  SIMULATOR_DEFAULT_WIDTH,
  SIMULATOR_DEFAULT_HEIGHT,
} from './RichTextEditor/index.js';
export type {
  SimulatorNodeProps,
  SimulatorSectionProps,
  RenderSimulatorEmbedsOptions,
} from './RichTextEditor/index.js';

// Blog Media (carousel + lightbox)
export { MediaCarousel } from './MediaCarousel/index.js';
export type {
  MediaCarouselProps,
  MediaCarouselSlide,
  MediaCarouselLabels,
  EmblaCarouselType,
} from './MediaCarousel/index.js';

export { Lightbox } from './Lightbox/index.js';
export type { LightboxProps, LightboxItem, LightboxLabels } from './Lightbox/index.js';
export {
  prepareLightboxMedia,
  buildMediaItem,
  useMediaClickDelegation,
  MEDIA_HOST_CLASS,
  MEDIA_EXPAND_CLASS,
  MEDIA_EXPAND_ATTR,
} from './Lightbox/index.js';
