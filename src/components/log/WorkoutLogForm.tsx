'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SliderField } from '@/components/shared/SliderField';
import { TagSelector } from '@/components/shared/TagSelector';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { useTemplates } from '@/hooks/useTemplates';
import {
  MUSCLE_GROUP_LABELS,
  MOOD_TAG_LABELS,
  type MuscleGroup,
  type MoodTag,
  type WorkoutCategory,
} from '@/lib/types';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_OPTIONS: { value: WorkoutCategory; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const MUSCLE_GROUP_OPTIONS = Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => ({
  value: value as MuscleGroup,
  label,
}));

const MOOD_TAG_OPTIONS = Object.entries(MOOD_TAG_LABELS).map(([value, label]) => ({
  value: value as MoodTag,
  label,
}));

interface WorkoutLogFormProps {
  onComplete?: () => void;
}

export function WorkoutLogForm({ onComplete }: WorkoutLogFormProps) {
  const { addWorkout } = useEvents();
  const { templates } = useTemplates();

  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [effort, setEffort] = useState(5);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [tags, setTags] = useState<MoodTag[]>([]);
  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [when, setWhen] = useState<Date | null>(null);

  const relevantTemplates = templates.filter((t) => t.category === category);

  const selectTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setTemplateId(id);
      setName(tmpl.name);
      setMuscleGroups(tmpl.muscleGroups);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await addWorkout({
      category,
      templateId,
      name: name.trim(),
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      effort,
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes || undefined,
      at: when ?? undefined,
    });
    setSaved(true);
    setTimeout(() => {
      onComplete?.();
    }, 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">Workout logged</p>
        <p className="text-sm text-muted-foreground">Keep up the great work.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Log workout</h2>
        <p className="text-sm text-muted-foreground mt-1">Track what you did.</p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setCategory(opt.value)}>
            <Badge
              variant={category === opt.value ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200 ${
                category === opt.value ? 'shadow-sm' : 'hover:bg-accent/60'
              }`}
            >
              {opt.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Template quick-pick */}
      {relevantTemplates.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-muted-foreground">Quick pick</p>
          <div className="grid gap-2">
            {relevantTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => selectTemplate(tmpl.id)}
                className={`text-left rounded-xl border p-3.5 text-sm transition-all duration-200 ${
                  templateId === tmpl.id
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:bg-accent/40 hover:border-border'
                }`}
              >
                <span className="font-medium">{tmpl.name}</span>
                {tmpl.muscleGroups.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {tmpl.muscleGroups.map((mg) => (
                      <Badge key={mg} variant="secondary" className="text-xs rounded-md">
                        {MUSCLE_GROUP_LABELS[mg]}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="workoutName">Workout name</Label>
        <Input
          id="workoutName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning run, Push day"
          className="rounded-lg"
        />
      </div>

      {/* Duration slider */}
      <SliderField
        label="Duration (minutes)"
        value={durationMinutes}
        onChange={setDurationMinutes}
        min={0}
        max={120}
        step={5}
        description="0 = not tracked"
      />

      {/* Effort slider */}
      <SliderField
        label="Effort level"
        value={effort}
        onChange={setEffort}
        min={1}
        max={10}
        description="1 = easy, 10 = max effort"
      />

      {/* More details toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showMore ? 'Less details' : 'More details (optional)'}
      </button>

      {showMore && (
        <div className="space-y-4 animate-fade-in">
          <TagSelector
            label="Muscle groups"
            options={MUSCLE_GROUP_OPTIONS}
            selected={muscleGroups}
            onChange={setMuscleGroups}
          />

          <TagSelector
            label="How are you feeling?"
            options={MOOD_TAG_OPTIONS}
            selected={tags}
            onChange={setTags}
          />

          <div className="space-y-2">
            <Label htmlFor="workoutNotes">Notes</Label>
            <Textarea
              id="workoutNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this workout"
              rows={2}
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg" disabled={!name.trim()}>
        Log workout
      </Button>
    </div>
  );
}
