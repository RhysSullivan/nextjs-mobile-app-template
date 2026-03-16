'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { CheckCircle2 } from 'lucide-react';

interface NoteLogFormProps {
  onComplete?: () => void;
}

export function NoteLogForm({ onComplete }: NoteLogFormProps) {
  const { addNote } = useEvents();
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState('');
  const [when, setWhen] = useState<Date | null>(null);

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    await addNote(notes, when ?? undefined);
    setSaved(true);
    setTimeout(() => onComplete?.(), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">Note saved</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Quick note</h2>
        <p className="text-sm text-muted-foreground mt-1">Write anything.</p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="A thought, observation, or anything on your mind"
          rows={4}
          autoFocus
          className="rounded-lg"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg" disabled={!notes.trim()}>
        Save note
      </Button>
    </div>
  );
}
