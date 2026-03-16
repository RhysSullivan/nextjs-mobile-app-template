'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { orpc } from '@/lib/orpc';
import { DEFAULT_TEMPLATES } from '@/lib/defaults';
import type { WorkoutTemplate, MuscleGroup, WorkoutCategory } from '@/lib/types';

export function useTemplates() {
  const queryClient = useQueryClient();

  const query = useQuery({
    ...orpc.templates.get.queryOptions({}),
    placeholderData: DEFAULT_TEMPLATES,
  });

  const addMutation = useMutation({
    ...orpc.templates.add.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.templates.get.queryKey({}), data);
    },
  });

  const deleteMutation = useMutation({
    ...orpc.templates.delete.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.templates.get.queryKey({}), data);
    },
  });

  const templates = (query.data ?? DEFAULT_TEMPLATES) as WorkoutTemplate[];

  const addTemplate = useCallback(async (data: {
    category: WorkoutCategory;
    name: string;
    muscleGroups: MuscleGroup[];
  }) => {
    const template: WorkoutTemplate = {
      id: `tmpl_${uuid()}`,
      ...data,
    };
    await addMutation.mutateAsync(template);
    return template;
  }, [addMutation]);

  const deleteTemplate = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  }, [deleteMutation]);

  const getByCategory = useCallback((category: WorkoutCategory) => {
    return templates.filter((t) => t.category === category);
  }, [templates]);

  return {
    templates,
    isLoading: query.isLoading,
    addTemplate,
    deleteTemplate,
    getByCategory,
  };
}
