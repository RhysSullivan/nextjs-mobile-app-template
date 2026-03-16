'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { CheckCircle2 } from 'lucide-react';

interface RestDayFormProps {
  onComplete?: () => void;
}

export function RestDayForm({ onComplete }: RestDayFormProps) {
  const { addRestDay } = useEvents();
  const [saved, setSaved] = useState(false);
  const [reason, setReason] = useState('');
  const [when, setWhen] = useState<Date | null>(null);

  const handleSubmit = async () => {
    await addRestDay(reason || undefined, when ?? undefined);
    setSaved(true);
    setTimeout(() => onComplete?.(), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">Rest day logged</p>
        <p className="text-sm text-muted-foreground">Recovery is part of the plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Rest day</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rest days build consistency, not guilt.
        </p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Feeling sore, active recovery, planned rest"
          rows={3}
          className="rounded-lg"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg">
        Log rest day
      </Button>
    </div>
  );
}
