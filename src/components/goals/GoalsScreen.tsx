'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useGoals } from '@/hooks/useGoals';
import { SUGGESTED_GOALS } from '@/lib/defaults';
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function GoalsScreen() {
  const { goals, activeGoals, addGoal, completeGoal, deleteGoal } = useGoals();
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [showPast, setShowPast] = useState(false);

  const pastGoals = goals.filter((g) => !g.active);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await addGoal(newGoal.trim());
    setNewGoal('');
    setShowAdd(false);
  };

  const handleAddSuggested = async (description: string) => {
    if (activeGoals.length >= 2) return;
    await addGoal(description);
  };

  const handleCompleteGoal = async (id: string) => {
    await completeGoal(id, outcomeText || 'Completed');
    setCompletingId(null);
    setOutcomeText('');
  };

  // Filter out suggestions that are already active goals
  const availableSuggestions = SUGGESTED_GOALS.filter(
    (sg) => !activeGoals.some((g) => g.description === sg)
  );

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Goals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Focus on 1-2 goals at a time.
          </p>
        </div>
        {activeGoals.length < 2 && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="rounded-lg">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Active goals ({activeGoals.length}/2)
          </h3>
          {activeGoals.map((goal) => (
            <Card key={goal.id} className="border-primary/20 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{goal.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                      {format(new Date(goal.startDate), 'MMM d')} &mdash;{' '}
                      {format(new Date(goal.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {completingId === goal.id ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor={`outcome-${goal.id}`}>How did it go?</Label>
                      <Textarea
                        id={`outcome-${goal.id}`}
                        value={outcomeText}
                        onChange={(e) => setOutcomeText(e.target.value)}
                        placeholder="e.g., Hit 4 out of 5 days, felt great"
                        rows={2}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="rounded-lg"
                      >
                        <CheckCircle2 className="mr-1.5 h-3 w-3" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCompletingId(null);
                          setOutcomeText('');
                        }}
                        className="rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCompletingId(goal.id)}
                      className="rounded-lg"
                    >
                      Mark complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add custom goal */}
      {showAdd && (
        <Card className="shadow-sm animate-fade-in">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newGoal">New goal</Label>
              <Input
                id="newGoal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., Run 3 times this week"
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddGoal} size="sm" disabled={!newGoal.trim()} className="rounded-lg">
                Add goal
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="rounded-lg">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested goals */}
      {activeGoals.length < 2 && availableSuggestions.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Suggestions
          </h3>
          <div className="grid gap-2">
            {availableSuggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleAddSuggested(suggestion)}
                className="text-left rounded-xl border border-border/60 p-3.5 text-sm transition-all duration-200 hover:bg-accent/40 hover:border-border"
              >
                <div className="flex items-center gap-2.5">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Past goals */}
      {pastGoals.length > 0 && (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {showPast ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Past goals ({pastGoals.length})
          </button>

          {showPast && (
            <div className="grid gap-2 animate-fade-in">
              {pastGoals.map((goal) => (
                <Card key={goal.id} className="shadow-sm">
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground line-through">{goal.description}</p>
                        {goal.outcome && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{goal.outcome}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                          {format(new Date(goal.startDate), 'MMM d')} &mdash;{' '}
                          {format(new Date(goal.endDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
            <Target className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            No goals yet. Pick one from the suggestions or add your own.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          Small, focused goals drive the biggest changes.
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
