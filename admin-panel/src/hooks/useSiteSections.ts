import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSectionsApi } from '../api/siteSections.api';

export function useSiteSections() {
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['siteSections'],
    queryFn: () => siteSectionsApi.getAll(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      siteSectionsApi.update(id, { visible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['siteSections'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (sectionOrder: Array<{ id: string; order: number }>) =>
      siteSectionsApi.reorder(sectionOrder),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['siteSections'] }),
  });

  const toggleSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) toggleMutation.mutate({ id, visible: !section.visible });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const newOrder = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    const reorderData = newOrder.map((s, i) => ({ id: s.id, order: i }));
    reorderMutation.mutate(reorderData);
  };

  return { sections, isLoading, toggleSection, moveSection };
}
