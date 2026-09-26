'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Check, FileText, ImagePlus, LoaderCircle, Plus, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { scanTimetable } from '@/lib/ai/timetableScanner';
import { parseScannedTimetable } from '@/lib/ai/timetableSchema';
import { TimetablePersistenceError, timetablePersistenceMessage } from '@/lib/timetable';
import { ScannedTimetableClass, WEEKDAYS } from '@/types/timetable';
import { TimetableClassRow } from '@/types/timetable';

interface DraftClass extends ScannedTimetableClass {
  draftId: string;
}

interface TimetableScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classes: ScannedTimetableClass[]) => Promise<{ insertedCount: number; classes: TimetableClassRow[] }>;
  onCalendarPrompt: (classes: TimetableClassRow[]) => void;
}

type ScannerPhase = 'upload' | 'processing' | 'review' | 'saving' | 'success';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg']);

function newDraftClass(): DraftClass {
  return {
    draftId: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `class-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    subject: '',
    course_code: null,
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room: null,
    lecturer: null,
  };
}

function validateFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ACCEPTED_EXTENSIONS.has(extension)) return 'Please choose a PDF, JPG, JPEG, or PNG file.';
  if (file.size > MAX_FILE_SIZE) return 'Please choose a file smaller than 10 MB.';
  return null;
}

function minutes(time: string): number {
  const [hours, minute] = time.split(':').map(Number);
  return hours * 60 + minute;
}

function classFingerprint(item: ScannedTimetableClass): string {
  return [item.subject, item.course_code ?? '', item.day, item.start_time, item.end_time, item.room ?? '']
    .map((part) => part.trim().toLowerCase())
    .join('|');
}

export function TimetableScanner({ isOpen, onClose, onConfirm, onCalendarPrompt }: TimetableScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<DraftClass[]>([]);
  const [phase, setPhase] = useState<ScannerPhase>('upload');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFile(null);
      setClasses([]);
      setError(null);
      setSuccessMessage(null);
      setPhase('upload');
    }
  }, [isOpen]);

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    classes.forEach((item) => {
      const fingerprint = classFingerprint(item);
      if (seen.has(fingerprint)) duplicates.add(item.draftId);
      else seen.add(fingerprint);
    });
    return duplicates;
  }, [classes]);

  const handleSelectFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    const validationError = validateFile(selectedFile);
    setError(validationError);
    if (validationError) {
      setFile(null);
      return;
    }
    setClasses([]);
    setSuccessMessage(null);
    setPhase('upload');
    setFile(selectedFile);
  };

  const handleScan = async () => {
    if (!file) return;
    setError(null);
    setPhase('processing');
    try {
      const detected = await scanTimetable(file);
      if (detected.length === 0) {
        setPhase('upload');
        setError("Bloom couldn't quite read this timetable. Try uploading a clearer image or PDF.");
        return;
      }
      setClasses(detected.map((item) => ({ ...item, draftId: newDraftClass().draftId })));
      setPhase('review');
    } catch (scanError) {
      setPhase('upload');
      setError(scanError instanceof Error ? scanError.message : 'Bloom could not read this timetable.');
    }
  };

  const updateClass = (draftId: string, updates: Partial<ScannedTimetableClass>) => {
    setClasses((previous) => previous.map((item) =>
      item.draftId === draftId ? { ...item, ...updates } : item
    ));
  };

  const handleAddToBloom = async () => {
    setError(null);
    try {
      const validated = parseScannedTimetable({
        classes: classes.map(({ draftId: _draftId, ...item }) => item),
      });
      if (validated.classes.length === 0) {
        setError('Add at least one class before saving.');
        return;
      }
      setPhase('saving');
      const result = await onConfirm(validated.classes);
      setSuccessMessage(
        result.insertedCount === 0
          ? 'These classes are already in your timetable.'
          : `${result.insertedCount} ${result.insertedCount === 1 ? 'class' : 'classes'} added to your timetable.`
      );
      setPhase('success');
      if (result.classes.length > 0) onCalendarPrompt(result.classes);
    } catch (saveError) {
      setPhase('review');
      setError(saveError instanceof TimetablePersistenceError
        ? saveError.message
        : timetablePersistenceMessage('save_failed'));
    }
  };

  const resetScanner = () => {
    setFile(null);
    setClasses([]);
    setError(null);
    setSuccessMessage(null);
    setPhase('upload');
  };

  const fieldClass = 'w-full rounded-xl border border-white/85 bg-white/75 px-3 py-2 text-[12px] text-[#351A26] outline-none focus:border-[#B85C7A]/40 focus:ring-2 focus:ring-[#B85C7A]/10';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={phase === 'success' ? 'Your timetable is ready' : 'Scan your timetable ✨'}
      description={phase === 'review' ? 'Check each class before adding it to Bloom.' : 'Upload a weekly timetable and Bloom will read the class slots.'}
      maxWidth="xl"
    >
      {error && (
        <p role="alert" className="mb-4 rounded-2xl border border-[#B85C7A]/25 bg-[#F8E3E8]/70 px-4 py-3 text-[12px] text-[#701F43]">
          {error}
        </p>
      )}

      {phase === 'upload' && (
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(event) => handleSelectFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDropActive(true); }}
            onDragLeave={() => setIsDropActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDropActive(false);
              handleSelectFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-40 w-full flex-col items-center justify-center rounded-[24px] border border-dashed px-5 py-7 text-center transition ${isDropActive ? 'border-[#8E3159] bg-[#F8E3E8]/80' : 'border-[#B85C7A]/35 bg-white/45 hover:bg-white/65'}`}
          >
            <UploadCloud className="mb-2 h-6 w-6 text-[#8E3159]" />
            <span className="text-[13px] font-medium text-[#351A26]">Drop your timetable here</span>
            <span className="mt-1 text-[11px] text-[#684653]">or choose a file · PDF, JPG, PNG · up to 10 MB</span>
          </button>

          {file && (
            <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-[12px] text-[#684653]">
              {file.type === 'application/pdf' ? <FileText className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Remove selected file" className="rounded-full p-1 hover:bg-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="primary" size="sm" disabled={!file} onClick={handleScan}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Scan timetable
            </Button>
          </div>
        </div>
      )}

      {(phase === 'processing' || phase === 'saving') && (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#8E3159]" />
          <p className="editorial text-xl text-[#351A26]">
            {phase === 'processing' ? 'Bloom is reading your timetable…' : 'Adding confirmed classes…'}
          </p>
          <p className="text-[11px] text-[#967783]">{phase === 'processing' ? 'This usually takes a few moments.' : 'Your classes are being saved to your timetable.'}</p>
        </div>
      )}

      {phase === 'review' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-[#351A26]">We found {classes.length} {classes.length === 1 ? 'class' : 'classes'}</p>
            <button type="button" onClick={resetScanner} className="text-[11px] font-medium text-[#8E3159] hover:underline">Rescan</button>
          </div>

          <div className="max-h-[48dvh] space-y-3 overflow-y-auto pr-1">
            {classes.map((item) => {
              const overlapping = classes.some((other) =>
                other.draftId !== item.draftId &&
                other.day === item.day &&
                item.start_time < other.end_time &&
                other.start_time < item.end_time
              );
              return (
                <article key={item.draftId} className="rounded-[20px] border border-white/85 bg-white/60 p-3.5 shadow-sm backdrop-blur-xl sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="truncate text-[12px] font-semibold text-[#351A26]">
                      {item.day} · {item.start_time}–{item.end_time}
                    </p>
                    <button
                      type="button"
                      onClick={() => setClasses((previous) => previous.filter((row) => row.draftId !== item.draftId))}
                      aria-label={`Remove ${item.subject || 'class'}`}
                      className="rounded-full p-1.5 text-[#967783] transition hover:bg-[#F8E3E8] hover:text-[#701F43]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input aria-label="Subject" className={fieldClass} placeholder="Subject" value={item.subject} onChange={(event) => updateClass(item.draftId, { subject: event.target.value })} />
                    <input aria-label="Course code" className={fieldClass} placeholder="Course code (optional)" value={item.course_code ?? ''} onChange={(event) => updateClass(item.draftId, { course_code: event.target.value || null })} />
                    <select aria-label="Day" className={fieldClass} value={item.day} onChange={(event) => updateClass(item.draftId, { day: event.target.value as ScannedTimetableClass['day'] })}>
                      {WEEKDAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input aria-label="Start time" type="time" className={fieldClass} value={item.start_time} onChange={(event) => updateClass(item.draftId, { start_time: event.target.value })} />
                      <input aria-label="End time" type="time" className={fieldClass} value={item.end_time} onChange={(event) => updateClass(item.draftId, { end_time: event.target.value })} />
                    </div>
                    <input aria-label="Room" className={fieldClass} placeholder="Room (optional)" value={item.room ?? ''} onChange={(event) => updateClass(item.draftId, { room: event.target.value || null })} />
                    <input aria-label="Lecturer" className={fieldClass} placeholder="Lecturer (optional)" value={item.lecturer ?? ''} onChange={(event) => updateClass(item.draftId, { lecturer: event.target.value || null })} />
                  </div>

                  {duplicateIds.has(item.draftId) && <p className="mt-2 text-[10px] text-[#8E3159]">This looks like a duplicate class. Remove one copy if it is not intentional.</p>}
                  {overlapping && <p className="mt-2 text-[10px] text-[#8E3159]">This time overlaps another class. Check the schedule before saving.</p>}
                </article>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/65 pt-3">
            <button
              type="button"
              onClick={() => setClasses((previous) => [...previous, newDraftClass()])}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium text-[#8E3159] transition hover:bg-white/60"
            >
              <Plus className="h-3.5 w-3.5" /> Add a class
            </button>
            <Button type="button" variant="primary" size="sm" disabled={classes.length === 0} onClick={handleAddToBloom}>
              <Check className="mr-1.5 h-4 w-4" /> Add to Bloom
            </Button>
          </div>
        </div>
      )}

      {phase === 'success' && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E3E8] text-[#701F43]"><Check className="h-5 w-5" /></span>
          <p className="editorial text-2xl text-[#351A26]">Your timetable has been added to Bloom.</p>
          <p className="text-[12px] text-[#684653]">{successMessage}</p>
          <Button type="button" variant="primary" size="sm" onClick={onClose}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
