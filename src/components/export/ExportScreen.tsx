'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { client } from '@/lib/orpc';
import type { ExportData } from '@/lib/types';
import {
  Download,
  Upload,
  Copy,
  CheckCircle2,
  FileJson,
  AlertTriangle,
  Activity,
  Trash2,
} from 'lucide-react';

function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function ExportScreen() {
  const [status, setStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExportFull = async () => {
    try {
      const data = await client.export({});
      downloadJSON(data, `workout-export-${format(new Date(), 'yyyy-MM-dd')}.json`);
      setStatus('Full export downloaded.');
    } catch {
      setStatus('Export failed.');
    }
  };

  const handleCopyFull = async () => {
    try {
      const data = await client.export({});
      await copyToClipboard(JSON.stringify(data, null, 2));
      setStatus('Full JSON copied to clipboard.');
    } catch {
      setStatus('Copy failed.');
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importText) as ExportData;
      const result = await client.import({ action: 'import', data });
      setStatus(result.message);
      if (result.ok) {
        setImporting(false);
        setImportText('');
      }
    } catch {
      setStatus('Invalid JSON. Please check the format.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text) as ExportData;
        const result = await client.import({ action: 'import', data });
        setStatus(result.message);
      } catch {
        setStatus('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('This will delete ALL your data. This cannot be undone. Are you sure?')) {
      await client.import({ action: 'clear' });
      setStatus('All data cleared.');
    }
  };

  const handleResetApp = async () => {
    if (
      window.confirm('This will reset the entire app to its initial state. Are you sure?')
    ) {
      await client.import({ action: 'reset' });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h2 className="font-display text-3xl tracking-tight">Export & import</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Your data belongs to you. Export, import, or manage it here.
        </p>
      </div>

      {/* Status */}
      {status && (
        <Card className="border-green-300/50 dark:border-green-800/50 shadow-sm animate-fade-in">
          <CardContent className="flex items-center gap-3 p-3.5">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm">{status}</p>
          </CardContent>
        </Card>
      )}

      {/* Export options */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Export
        </h3>

        <div className="grid gap-2.5">
          <Button variant="outline" onClick={handleExportFull} className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border">
            <Download className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">Download full export</p>
              <p className="text-xs text-muted-foreground">All data as JSON file</p>
            </div>
          </Button>

          <Button variant="outline" onClick={handleCopyFull} className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border">
            <Copy className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">Copy JSON to clipboard</p>
              <p className="text-xs text-muted-foreground">Full export as text</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Import
        </h3>

        <div className="grid gap-2.5">
          <label className="cursor-pointer">
            <Button variant="outline" className="justify-start h-auto py-3.5 w-full pointer-events-none rounded-xl border-border/60">
              <Upload className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
              <div className="text-left">
                <p className="text-sm font-medium">Import from file</p>
                <p className="text-xs text-muted-foreground">Upload a JSON export file</p>
              </div>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>

          <Button
            variant="outline"
            onClick={() => setImporting(!importing)}
            className="justify-start h-auto py-3.5 rounded-xl border-border/60 hover:border-border"
          >
            <FileJson className="mr-3 h-4 w-4 shrink-0 text-primary/70" />
            <div className="text-left">
              <p className="text-sm font-medium">Import from text</p>
              <p className="text-xs text-muted-foreground">Paste JSON directly</p>
            </div>
          </Button>
        </div>

        {importing && (
          <Card className="shadow-sm animate-fade-in">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="importJson">Paste your JSON export:</Label>
              <Textarea
                id="importJson"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"schemaVersion": "1.0.0", ...}'
                rows={6}
                className="font-mono text-xs rounded-lg"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleImport} disabled={!importText.trim()} className="rounded-lg">
                  Import
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setImporting(false);
                    setImportText('');
                  }}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data management */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Data management
        </h3>

        <div className="grid gap-2.5">
          <Button
            variant="outline"
            onClick={handleClearData}
            className="justify-start h-auto py-3.5 rounded-xl border-red-200/60 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800"
          >
            <Trash2 className="mr-3 h-4 w-4 shrink-0 text-red-500/70" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Clear all data</p>
              <p className="text-xs text-muted-foreground">Delete logs, keep settings</p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleResetApp}
            className="justify-start h-auto py-3.5 rounded-xl border-red-200/60 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800"
          >
            <AlertTriangle className="mr-3 h-4 w-4 shrink-0 text-red-500/70" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Reset entire app</p>
              <p className="text-xs text-muted-foreground">Back to initial state</p>
            </div>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          Your data, your rules. Export before clearing.
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
