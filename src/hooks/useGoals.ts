'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { format, addDays } from 'date-fns';
import { orpc } from '@/lib/orpc';
import type { Goal } from '@/lib/types';

export function useGoals() {
  const queryClient = useQueryClient();

  const query = useQuery(
    orpc.goals.get.queryOptions({}),
  );

  const addMutation = useMutation({
    ...orpc.goals.add.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.goals.get.queryKey({}), data);
    },
  });

  const updateMutation = useMutation({
    ...orpc.goals.update.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.goals.get.queryKey({}), data);
    },
  });

  const deleteMutation = useMutation({
    ...orpc.goals.delete.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(orpc.goals.get.queryKey({}), data);
    },
  });

  const goals = (query.data ?? []) as Goal[];

  const addGoal = useCallback(async (description: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const goal: Goal = {
      id: `goal_${uuid()}`,
      description,
      startDate: today,
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      active: true,
      createdAt: new Date().toISOString(),
    };
    await addMutation.mutateAsync(goal);
    return goal;
  }, [addMutation]);

  const completeGoal = useCallback(async (id: string, outcome: string) => {
    await updateMutation.mutateAsync({ id, active: false, outcome });
  }, [updateMutation]);

  const deleteGoal = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  }, [deleteMutation]);

  const activeGoals = goals.filter((g) => g.active);

  return {
    goals,
    activeGoals,
    isLoading: query.isLoading,
    addGoal,
    completeGoal,
    deleteGoal,
  };
}
