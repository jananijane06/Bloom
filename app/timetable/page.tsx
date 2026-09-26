'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TimetableScanner } from '@/components/timetable/TimetableScanner';
import TimetableExportActions from '@/components/timetable/TimetableExportActions';
import { TimetableCalendarPrompt } from '@/components/timetable/TimetableCalendarPrompt';
import { useAuth } from '@/components/auth/AuthProvider';
import { createTimetableClasses, deleteTimetableClass, fetchMatchingTimetableClasses, fetchTimetableClasses, scannedClassToInsert, timetablePersistenceMessage, TimetablePersistenceError, updateTimetableClass } from '@/lib/timetable';
import { addTimetableClassesToCalendar, syncTimetableCalendarEvents, TimetableCalendarPeriod } from '@/lib/calendarEvents';
import { cn } from '@/lib/utils';
import { NUMBER_TO_SHORT_DAY, SHORT_DAY_TO_NUMBER, TimetableClassInsert, TimetableClassRow } from '@/types/timetable';
import { Plus, Sparkles } from 'lucide-react';

type ShortDay = keyof typeof SHORT_DAY_TO_NUMBER;
type Category = 'focus' | 'wellness' | 'class' | 'routine';

interface TimetableBlock {
  id: string;
  day: ShortDay;
  startTime: string;
  endTime: string;
  title: string;
  category: Category;
  courseCode?: string | null;
  location?: string | null;
  lecturer?: string | null;
}

const DAYS: ShortDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toBlock(row: TimetableClassRow): TimetableBlock {
  const category: Category = ['focus', 'wellness', 'class', 'routine'].includes(row.category)
    ? (row.category as Category)
    : 'class';
  return {
    id: row.id,
    day: NUMBER_TO_SHORT_DAY[row.day_of_week],
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    title: row.subject,
    category,
    courseCode: row.course_code,
    location: row.room,
    lecturer: row.lecturer,
  };
}

function blockToInsert(block: Omit<TimetableBlock, 'id'>): TimetableClassInsert {
  return {
    subject: block.title,
    day_of_week: SHORT_DAY_TO_NUMBER[block.day],
    start_time: block.startTime,
    end_time: block.endTime,
    category: block.category,
    course_code: block.courseCode || null,
    room: block.location || null,
    lecturer: block.lecturer || null,
  };
}

function TimetableColumns({
  days,
  blocks,
  getCategoryStyles,
  stacked = false,
  onSelect,
}: {
  days: ShortDay[];
  blocks: TimetableBlock[];
  getCategoryStyles: (category: Category) => string;
  stacked?: boolean;
  onSelect?: (block: TimetableBlock) => void;
}) {
  return (
    <div className={stacked ? 'space-y-4' : 'min-w-[700px]'}>
      {!stacked && (
        <div className="grid grid-cols-7 gap-3 pb-3 border-b border-white/60 text-center font-bold text-xs uppercase tracking-wider text-outline">
          {days.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>
      )}
      <div className={stacked ? 'space-y-4' : 'grid grid-cols-7 gap-3 pt-4'}>
        {days.map((day) => {
          const dayBlocks = blocks
            .filter((block) => block.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={day} className={stacked ? 'rounded-2xl border border-white/80 bg-white/35 p-4' : 'space-y-3 min-h-[300px]'}>
              {stacked && <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{day}</h2>}
              {dayBlocks.length === 0 ? (
                <div className={cn(
                  'rounded-xl border border-dashed border-white/80 bg-white/20 flex items-center justify-center text-[11px] text-outline text-center px-2',
                  stacked ? 'min-h-12' : 'h-32'
                )}>Open space</div>
              ) : (
                <div className={stacked ? 'space-y-2' : 'space-y-3'}>
                  {dayBlocks.map((block) => (
                    <button key={block.id} type="button" onClick={() => onSelect?.(block)} className={cn(
                      'p-3 rounded-xl border text-xs shadow-sm transition-all hover:scale-[1.02] backdrop-blur-sm',
                      onSelect ? 'w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40' : 'text-left cursor-default',
                      getCategoryStyles(block.category)
                    )}>
                      <span className="block text-[10px] font-bold opacity-75">{block.startTime} – {block.endTime}</span>
                      <span className="font-semibold text-on-surface block mt-1 leading-snug">{block.title}</span>
                      {(block.courseCode || block.location || block.lecturer) && (
                        <span className="block mt-1.5 text-[10px] leading-relaxed text-on-surface-variant">
                          {[block.courseCode, block.location, block.lecturer].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold opacity-70">{block.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [blocks, setBlocks] = useState<TimetableBlock[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarClasses, setCalendarClasses] = useState<TimetableClassRow[]>([]);
  const [pageError, setPageError] = useState('');
  const [editingBlock, setEditingBlock] = useState<TimetableBlock | null>(null);
  const [editForm, setEditForm] = useState({ title: '', courseCode: '', day: 'Mon' as ShortDay, startTime: '09:00', endTime: '10:00', location: '', lecturer: '', category: 'class' as Category });
  const [editError, setEditError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState<ShortDay>('Mon');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newCategory, setNewCategory] = useState<Category>('focus');
  const boardRef = useRef<HTMLDivElement>(null);
  const mobileExportRef = useRef<HTMLDivElement>(null);

  const loadClasses = useCallback(async () => {
    if (!user?.id) {
      setBlocks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const rows = await fetchTimetableClasses(user.id);
      setBlocks(rows.map(toBlock));
      setPageError('');
    } catch (error) {
      setPageError(error instanceof TimetablePersistenceError
        ? error.message
        : 'Bloom could not load your timetable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) void loadClasses();
  }, [authLoading, loadClasses]);

  const filteredBlocks = useMemo(() => blocks.filter((block) => (
    selectedCategory === 'all' || block.category === selectedCategory
  )), [blocks, selectedCategory]);

  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case 'focus': return 'bg-primary/10 text-primary border-primary/20';
      case 'wellness': return 'bg-[#B85C7A]/15 text-[#B85C7A] border-[#B85C7A]/30';
      case 'class': return 'bg-[#701F43]/15 text-[#701F43] border-[#701F43]/30';
      default: return 'bg-[#B85C7A]/15 text-[#B85C7A] border-[#B85C7A]/30';
    }
  };

  const handleAddBlock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim() || !user?.id) {
      setPageError(user ? 'Add a title for this block.' : 'Sign in to save a timetable block.');
      return;
    }
    if (newStartTime >= newEndTime) {
      setPageError('The end time needs to be later than the start time.');
      return;
    }

    setIsSaving(true);
    setPageError('');
    try {
      const input = blockToInsert({
        day: newDay,
        startTime: newStartTime,
        endTime: newEndTime,
        title: newTitle.trim(),
        category: newCategory,
      });
      const saved = await createTimetableClasses([input], user.id);
      if (saved.length) setBlocks((previous) => [...previous, ...saved.map(toBlock)]);
      const persistedClasses = await fetchMatchingTimetableClasses([input], user.id);
      setNewTitle('');
      setIsModalOpen(false);
      setCalendarClasses(persistedClasses);
    } catch (error) {
      setPageError(error instanceof TimetablePersistenceError
        ? error.message
        : timetablePersistenceMessage('save_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleScannerConfirm = async (classes: Parameters<typeof scannedClassToInsert>[0][]) => {
    if (!user?.id) throw new Error('Sign in to save timetable classes.');
    const input = classes.map(scannedClassToInsert);
    const saved = await createTimetableClasses(input, user.id);
    const persistedClasses = await fetchMatchingTimetableClasses(input, user.id);
    await loadClasses();
    return { insertedCount: saved.length, classes: persistedClasses };
  };

  const handleAddTimetableEvents = async (period: TimetableCalendarPeriod) => {
    if (!user?.id) throw new Error('Sign in to add timetable classes to Calendar.');
    await addTimetableClassesToCalendar(calendarClasses, period, user.id);
  };

  const openEditor = (block: TimetableBlock) => {
    setEditingBlock(block);
    setEditForm({ title: block.title, courseCode: block.courseCode ?? '', day: block.day, startTime: block.startTime, endTime: block.endTime, location: block.location ?? '', lecturer: block.lecturer ?? '', category: block.category });
    setEditError('');
  };

  const handleEditSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingBlock || !user?.id) return;
    const title = editForm.title.trim();
    if (!title) { setEditError('Add a subject for this class.'); return; }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(editForm.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(editForm.endTime) || editForm.startTime >= editForm.endTime) {
      setEditError('Choose a valid time range. The end time must be later than the start time.');
      return;
    }
    const updated: TimetableBlock = { ...editingBlock, ...editForm, title, courseCode: editForm.courseCode.trim() || null, location: editForm.location.trim() || null, lecturer: editForm.lecturer.trim() || null };
    const previous = editingBlock;
    setBlocks((items) => items.map((item) => item.id === previous.id ? updated : item));
    setIsEditSaving(true);
    setEditError('');
    try {
      const saved = await updateTimetableClass(previous.id, blockToInsert(updated), user.id);
      setBlocks((items) => items.map((item) => item.id === previous.id ? toBlock(saved) : item));
      setEditingBlock(null);
      try {
        await syncTimetableCalendarEvents(saved, user.id);
        setCalendarClasses([saved]);
      } catch {
        setPageError('The class was saved, but its existing Calendar dates could not be updated. Please try saving the class again.');
      }
    } catch (error) {
      setBlocks((items) => items.map((item) => item.id === previous.id ? previous : item));
      setEditError(error instanceof TimetablePersistenceError ? error.message : timetablePersistenceMessage('save_failed'));
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDeleteBlock = async () => {
    if (!editingBlock || !user?.id || isEditSaving) return;
    if (!window.confirm(`Delete “${editingBlock.title}” from your timetable?`)) return;
    const previous = editingBlock;
    setBlocks((items) => items.filter((item) => item.id !== previous.id));
    setIsEditSaving(true);
    setEditError('');
    try {
      await deleteTimetableClass(previous.id, user.id);
      setEditingBlock(null);
    } catch (error) {
      setBlocks((items) => [...items, previous]);
      setEditError(error instanceof TimetablePersistenceError ? error.message : 'Bloom could not delete that class. Please try again.');
    } finally {
      setIsEditSaving(false);
    }
  };

  const exportBlocks = blocks;

  return (
    <AppShell>
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>
      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="editorial-label mb-2 text-primary">YOUR WEEK, AT A GLANCE</p>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">your week, at a glance</h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">Leave a little room between things.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-white/80 shadow-sm text-xs backdrop-blur-md">
                {(['all', 'focus', 'wellness'] as const).map((category) => (
                  <button key={category} onClick={() => setSelectedCategory(category)} className={cn(
                    'px-2.5 py-1 rounded-lg font-medium transition-colors',
                    selectedCategory === category ? 'bg-primary text-white font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  )}>
                    {category === 'all' ? 'All' : category === 'wellness' ? 'Wellness' : 'Focus'}
                  </button>
                ))}
              </div>
              <TimetableExportActions desktopRef={boardRef} mobileRef={mobileExportRef} />
              <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />} onClick={() => setScannerOpen(true)}>
                Scan Timetable
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                Add Routine Block
              </Button>
            </div>
          </div>

          {pageError && <p role="alert" className="rounded-xl border border-[#B85C7A]/25 bg-white/60 px-4 py-2 text-sm text-primary">{pageError}</p>}

          <GlassCard className="p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[700px] bg-[#FFF9F7]/30 p-1">
              <TimetableColumns days={DAYS} blocks={filteredBlocks} getCategoryStyles={getCategoryStyles} onSelect={openEditor} />
            </div>
            {isLoading && <p className="pt-3 text-center text-xs text-outline">Loading your timetable…</p>}
            {!isLoading && !blocks.length && <p className="pt-3 text-center text-xs text-outline">Your week is open. Add a routine block or scan your timetable.</p>}
          </GlassCard>

          {/* Export-only layouts include the full week, regardless of the active category filter. */}
          <div aria-hidden="true" className="fixed -left-[10000px] top-0 z-[-1] w-[1400px] bg-[#FFF9F7] p-6">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8E3159]">BLOOM · YOUR WEEK</p>
            <h1 className="mb-5 font-serif text-3xl text-[#351A26]">your week, at a glance</h1>
            <div ref={boardRef} className="rounded-3xl border border-white/90 bg-white/50 p-5 shadow-lg backdrop-blur-2xl">
              <TimetableColumns days={DAYS} blocks={blocks} getCategoryStyles={getCategoryStyles} />
            </div>
          </div>
          {/* Mobile export follows a readable, one-day-per-section layout. */}
          <div ref={mobileExportRef} aria-hidden="true" className="fixed -left-[10000px] top-0 z-[-1] w-[390px] bg-[#FFF9F7] p-5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8E3159]">BLOOM · YOUR WEEK</p>
            <h1 className="mb-5 font-serif text-3xl text-[#351A26]">your week, at a glance</h1>
            <TimetableColumns days={DAYS} blocks={exportBlocks} getCategoryStyles={getCategoryStyles} stacked />
          </div>

          <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title="Add Timetable Block" description="Schedule a recurring time block into your weekly flow.">
            <form onSubmit={handleAddBlock} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Title</label>
                <input type="text" placeholder="e.g. Deep Coding Session" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} required autoFocus className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Day</label>
                  <select value={newDay} onChange={(event) => setNewDay(event.target.value as ShortDay)} className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Category</label>
                  <select value={newCategory} onChange={(event) => setNewCategory(event.target.value as Category)} className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="focus">Focus time</option><option value="wellness">Wellbeing</option><option value="class">Study / class</option><option value="routine">General routine</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Start Time</label><input type="time" value={newStartTime} onChange={(event) => setNewStartTime(event.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">End Time</label><input type="time" value={newEndTime} onChange={(event) => setNewEndTime(event.target.value)} required className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>Save Block</Button>
              </div>
            </form>
          </Modal>
          <Modal isOpen={!!editingBlock} onClose={() => !isEditSaving && setEditingBlock(null)} title="Edit class" description="Make a change to this part of your week." maxWidth="lg">
            <form onSubmit={handleEditSave} className="space-y-3 pt-1">
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Subject</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required className="w-full min-w-0 rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <EditField label="Course code" value={editForm.courseCode} onChange={(value) => setEditForm({ ...editForm, courseCode: value })} />
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Day</label><select value={editForm.day} onChange={(e) => setEditForm({ ...editForm, day: e.target.value as ShortDay })} className="w-full rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface">{DAYS.map((day) => <option key={day}>{day}</option>)}</select></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Start time</label><input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} required className="w-full rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">End time</label><input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} required className="w-full rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface" /></div>
                <EditField label="Room" value={editForm.location} onChange={(value) => setEditForm({ ...editForm, location: value })} />
                <EditField label="Lecturer" value={editForm.lecturer} onChange={(value) => setEditForm({ ...editForm, lecturer: value })} />
                <div className="sm:col-span-2"><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">Category</label><select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })} className="w-full rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface"><option value="class">Study / class</option><option value="focus">Focus time</option><option value="wellness">Wellbeing</option><option value="routine">General routine</option></select></div>
              </div>
              {editError && <p role="alert" className="rounded-xl bg-[#B85C7A]/10 px-3 py-2 text-xs text-primary">{editError}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/70 pt-3">
                <Button type="button" variant="danger" size="sm" disabled={isEditSaving} onClick={() => void handleDeleteBlock()}>Delete</Button>
                <div className="flex items-center gap-2"><Button type="button" variant="ghost" size="sm" disabled={isEditSaving} onClick={() => setEditingBlock(null)}>Cancel</Button><Button type="submit" variant="primary" size="sm" isLoading={isEditSaving}>Save Changes</Button></div>
              </div>
            </form>
          </Modal>
          <TimetableScanner
            isOpen={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onConfirm={handleScannerConfirm}
            onCalendarPrompt={(classes) => { setCalendarClasses(classes); setScannerOpen(false); }}
          />
          <TimetableCalendarPrompt
            isOpen={calendarClasses.length > 0}
            classes={calendarClasses}
            onAdd={handleAddTimetableEvents}
            onClose={() => setCalendarClasses([])}
          />
        </div>
      </div>
    </AppShell>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 rounded-xl border border-white/90 bg-white/70 px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>;
}
