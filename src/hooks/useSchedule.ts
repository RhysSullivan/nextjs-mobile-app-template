'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { DEFAULT_SCHEDULE } from '@/lib/defaults';
import type { ScheduleSlot } from '@/lib/types';

export function useSchedule() {
  const queryClient = useQueryClient();

  const query = useQuery({
    ...orpc.schedule.get.queryOptions({}),
    placeholderData: DEFAULT_SCHEDULE,
  });

  const updateSlotMutation = useMutation({
    ...orpc.schedule.updateSlot.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.schedule.get.queryKey({}), data);
    },
  });

  const resetMutation = useMutation({
    ...orpc.schedule.reset.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.schedule.get.queryKey({}), data);
    },
  });

  return {
    schedule: (query.data ?? DEFAULT_SCHEDULE) as ScheduleSlot[],
    isLoading: query.isLoading,
    updateSlot: (index: number, updates: Partial<ScheduleSlot>) =>
      updateSlotMutation.mutateAsync({ index, updates }),
    resetSchedule: () => resetMutation.mutateAsync({}),
  };
}
