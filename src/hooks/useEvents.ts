'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { orpc } from '@/lib/orpc';
import type { AppEvent, WorkoutEvent, RestDayEvent, NoteEvent } from '@/lib/types';

export function useEvents(date?: string) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();

  const dateQuery = useQuery(
    orpc.events.getByDate.queryOptions({ input: { date: targetDate } }),
  );

  const allQuery = useQuery(
    orpc.events.getAll.queryOptions({}),
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: orpc.events.key() });
  }, [queryClient]);

  const addMutation = useMutation({
    ...orpc.events.add.mutationOptions(),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    ...orpc.events.delete.mutationOptions(),
    onSuccess: invalidateAll,
  });

  /** Resolve a timestamp — use the provided Date or fall back to now */
  const resolveTime = (at?: Date) => {
    const d = at ?? new Date();
    return {
      timestamp: d.toISOString(),
      localDate: format(d, 'yyyy-MM-dd'),
      localTime: format(d, 'HH:mm'),
    };
  };

  const addWorkout = useCallback(async (data: Omit<WorkoutEvent, 'id' | 'timestamp' | 'localDate' | 'localTime' | 'type'> & { at?: Date }) => {
    const { at, ...rest } = data;
    const event: WorkoutEvent = {
      id: `evt_${uuid()}`,
      ...resolveTime(at),
      type: 'workout',
      ...rest,
    };
    await addMutation.mutateAsync(event);
    return event;
  }, [addMutation]);

  const addRestDay = useCallback(async (reason?: string, at?: Date) => {
    const event: RestDayEvent = {
      id: `evt_${uuid()}`,
      ...resolveTime(at),
      type: 'rest_day',
      reason,
    };
    await addMutation.mutateAsync(event);
    return event;
  }, [addMutation]);

  const addNote = useCallback(async (notes: string, at?: Date) => {
    const event: NoteEvent = {
      id: `evt_${uuid()}`,
      ...resolveTime(at),
      type: 'note',
      notes,
    };
    await addMutation.mutateAsync(event);
    return event;
  }, [addMutation]);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  }, [deleteMutation]);

  return {
    events: (dateQuery.data ?? []) as AppEvent[],
    allEvents: (allQuery.data ?? []) as AppEvent[],
    isLoading: dateQuery.isLoading,
    addWorkout,
    addRestDay,
    addNote,
    deleteEvent,
  };
}
