import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../i18n/LanguageContext';
import { apiClient } from '../../api/client';
import styles from './TagInput.module.css';

const DEFAULT_MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Endpoint returning the suggestion list, e.g. '/blog-posts/tags'. */
  suggestionsUrl: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  max?: number;
  id?: string;
}

/**
 * Free-form tag input with suggestions fetched from the given endpoint.
 * - Enter or comma commits the current text as a new tag (trimmed, 1-30 chars).
 * - Suggestions update as tags are used (query refetched by the caller's
 *   queryClient invalidation) — no hardcoded closed list.
 * - Chips show the selected tags with a remove button; max 10 by default.
 */
export function TagInput({
  value,
  onChange,
  suggestionsUrl,
  label,
  placeholder,
  hint,
  error,
  max = DEFAULT_MAX_TAGS,
  id,
}: TagInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [internalError, setInternalError] = useState<string | undefined>(undefined);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['tag-suggestions', suggestionsUrl],
    queryFn: () => apiClient.get<string[]>(suggestionsUrl).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const filteredSuggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return suggestions;
    return suggestions.filter((tag) => tag.toLowerCase().includes(query));
  }, [suggestions, input]);

  const addTag = (raw: string): boolean => {
    const tag = raw.trim();
    if (!tag) return false;
    if (tag.length > MAX_TAG_LENGTH) {
      setInternalError(t('projects.tagTooLong'));
      return false;
    }
    if (value.length >= max) {
      setInternalError(t('projects.tagsMax'));
      return false;
    }
    if (value.includes(tag)) return false;
    onChange([...value, tag]);
    setInternalError(undefined);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (addTag(input)) setInput('');
    }
  };

  const handleBlur = () => {
    if (input) {
      addTag(input);
      setInput('');
    }
  };

  const removeTag = (target: string) => {
    onChange(value.filter((tag) => tag !== target));
  };

  const shownError = error ?? internalError;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={styles.control}>
        <input
          id={id}
          className={`${styles.input} ${shownError ? styles.inputError : ''}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder ?? t('projects.tagsHint')}
          role="combobox"
          aria-expanded={filteredSuggestions.length > 0}
          aria-autocomplete="list"
        />
        {filteredSuggestions.length > 0 && (
          <ul className={styles.suggestions} role="listbox">
            {filteredSuggestions.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  className={styles.suggestion}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (addTag(tag)) setInput('');
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {shownError && <span className={styles.error}>{shownError}</span>}
      {value.length > 0 && (
        <div className={styles.chips}>
          {value.map((tag) => (
            <span key={tag} className={styles.chip}>
              {tag}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => removeTag(tag)}
                aria-label={`${t('form.remove')} ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}