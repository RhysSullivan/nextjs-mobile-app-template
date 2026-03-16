'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { DEFAULT_PROFILE } from '@/lib/defaults';
import type { Profile } from '@/lib/types';

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    ...orpc.profile.get.queryOptions({}),
    placeholderData: DEFAULT_PROFILE,
  });

  const updateMutation = useMutation({
    ...orpc.profile.update.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.profile.get.queryKey({}), data);
    },
  });

  return {
    profile: (query.data ?? DEFAULT_PROFILE) as Profile,
    isLoading: query.isLoading,
    updateProfile: (updates: Partial<Profile>) => updateMutation.mutateAsync(updates),
  };
}
