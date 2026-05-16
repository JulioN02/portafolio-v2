import { useState, useEffect } from 'react';

export interface SectionOrder {
  id: string;
  label: string;
  enabled: boolean;
}

const DEFAULT_SECTIONS: SectionOrder[] = [
  { id: 'services', label: 'Services', enabled: true },
  { id: 'products', label: 'Products', enabled: true },
  { id: 'tools', label: 'Tools', enabled: true },
  { id: 'success-cases', label: 'Success Cases', enabled: true },
];

const STORAGE_KEY = 'admin_site_sections_order';

export function useSiteSections() {
  const [sections, setSections] = useState<SectionOrder[]>(DEFAULT_SECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSections(JSON.parse(stored));
      } catch {
        setSections(DEFAULT_SECTIONS);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSections = (newSections: SectionOrder[]) => {
    setSections(newSections);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
  };

  const toggleSection = (id: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    saveSections(updated);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ];
    saveSections(newSections);
  };

  return {
    sections,
    isLoaded,
    toggleSection,
    moveSection,
    saveSections,
  };
}