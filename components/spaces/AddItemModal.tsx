'use client';

import React, { useEffect, useState } from 'react';
import { AddItemType, MindfulMood, TaskPriority, ResourceType } from '@/types/spaceItems';
import {
  createSpaceTask,
  createSpaceNote,
  createSpaceDeadline,
  createSpaceResource,
} from '@/lib/spaceItems';
import { SpaceTask, MindfulNote, Deadline, Resource } from '@/types/spaceItems';
import { SpaceSelector } from './SpaceSelector';

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  userId?: string | null;
  initialType?: AddItemType;
  onTaskCreated?: (task: SpaceTask) => void;
  onNoteCreated?: (note: MindfulNote) => void;
  onDeadlineCreated?: (deadline: Deadline) => void;
  onResourceCreated?: (resource: Resource) => void;
}

const MOODS: { id: MindfulMood; label: string; icon: string }[] = [
  { id: 'calm', label: 'Calm', icon: '🌿' },
  { id: 'grateful', label: 'Grateful', icon: '🌸' },
  { id: 'inspired', label: 'Inspired', icon: '✨' },
  { id: 'reflective', label: 'Reflective', icon: '💭' },
  { id: 'focused', label: 'Focused', icon: '🎯' },
  { id: 'peaceful', label: 'Peaceful', icon: '🕊️' },
];

export function AddItemModal({
  isOpen,
  onClose,
  spaceId,
  userId,
  initialType = 'task',
  onTaskCreated,
  onNoteCreated,
  onDeadlineCreated,
  onResourceCreated,
}: AddItemModalProps) {
  const [activeType, setActiveType] = useState<AddItemType>(initialType);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(spaceId || null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedSpaceId(spaceId || null);
  }, [spaceId, isOpen]);

  useEffect(() => {
    if (isOpen) setActiveType(initialType);
  }, [initialType, isOpen]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteMood, setNoteMood] = useState<MindfulMood>('calm');
  const [notePinned, setNotePinned] = useState(false);

  // Deadline form state
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineDescription, setDeadlineDescription] = useState('');
  const [deadlineDueDate, setDeadlineDueDate] = useState('');
  const [deadlineDueTime, setDeadlineDueTime] = useState('');

  // Resource form state
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Link');

  if (!isOpen) return null;

  const resetForms = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskDueTime('');

    setNoteTitle('');
    setNoteContent('');
    setNoteMood('calm');
    setNotePinned(false);

    setDeadlineTitle('');
    setDeadlineDescription('');
    setDeadlineDueDate('');
    setDeadlineDueTime('');

    setResourceTitle('');
    setResourceUrl('');
    setResourceDescription('');
    setResourceType('Link');
  };

  const handleClose = () => {
    resetForms();
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);

    try {
      if (activeType === 'task') {
        if (!taskTitle.trim()) return;
        const created = await createSpaceTask(
          {
            space_id: selectedSpaceId,
            title: taskTitle.trim(),
            description: taskDescription.trim() || null,
            priority: taskPriority,
            due_date: taskDueDate || null,
            due_time: taskDueTime || null,
            completed: false,
          },
          userId
        );
        if (selectedSpaceId === spaceId) {
          onTaskCreated?.(created);
        }
      } else if (activeType === 'note') {
        if (!noteTitle.trim()) return;
        const created = await createSpaceNote(
          {
            space_id: selectedSpaceId,
            title: noteTitle.trim(),
            content: noteContent.trim(),
            mood: noteMood,
            pinned: notePinned,
          },
          userId
        );
        if (selectedSpaceId === spaceId) {
          onNoteCreated?.(created);
        }
      } else if (activeType === 'deadline') {
        if (!deadlineTitle.trim() || !deadlineDueDate) return;
        const created = await createSpaceDeadline(
          {
            space_id: selectedSpaceId,
            title: deadlineTitle.trim(),
            description: deadlineDescription.trim() || null,
            due_date: deadlineDueTime ? `${deadlineDueDate}T${deadlineDueTime}:00` : deadlineDueDate,
          },
          userId
        );
        if (selectedSpaceId === spaceId) {
          onDeadlineCreated?.(created);
        }
      } else if (activeType === 'resource') {
        if (!resourceTitle.trim()) return;
        const created = await createSpaceResource(
          {
            space_id: selectedSpaceId,
            title: resourceTitle.trim(),
            url: resourceUrl.trim() || null,
            description: resourceDescription.trim() || null,
            resource_type: resourceType,
          },
          userId
        );
        if (selectedSpaceId === spaceId) {
          onResourceCreated?.(created);
        }
      }

      handleClose();
    } catch (err) {
      console.error('Failed to create space item:', err);
      setSubmitError(
        err instanceof Error
          ? `Item was not saved: ${err.message}`
          : 'Item was not saved. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-fade-in"
    >
      <div className="glass-card w-full max-w-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-2xl bg-white/90 backdrop-blur-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <span>{activeType === 'note' ? 'Mindful Note' : activeType === 'task' ? 'Task' : activeType === 'deadline' ? 'Deadline' : 'Resource'}</span>
              <span className="text-primary text-[18px]"></span>
            </h2>
            <p className="text-[12px] sm:text-[13px] text-outline mt-0.5">
              {activeType === 'note' ? 'A quiet place to gather your thoughts.' : activeType === 'task' ? 'Give this task a place in your week.' : activeType === 'deadline' ? 'Keep an important date in view.' : 'Keep a useful reference close.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-on-surface hover:bg-black/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ACTIVE FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. TASK FORM */}
          {activeType === 'task' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete chapter 4 synthesis notes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Description / Sub-notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or checklist notes..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-[13px] text-on-surface placeholder:text-outline focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2.5 text-[13px] text-on-surface focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                    <option value="urgent">🔥 Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2 text-[13px] text-on-surface focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Due Time
                </label>
                <input
                  type="time"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2 text-[13px] text-on-surface focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/80 bg-white/45 px-3.5 py-2.5">
                <span className="text-[12px] font-semibold text-on-surface-variant">Status</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">To Do</span>
              </div>
            </div>
          )}

          {/* 2. MINDFUL NOTE FORM */}
          {activeType === 'note' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Key Takeaways & Thesis Sketch"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Reflect deeply, jot down thoughts, formulas, or summaries..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Mindful Mood
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNoteMood(m.id)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border text-[11px] font-semibold transition ${
                        noteMood === m.id
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-white/80 bg-white/60 text-outline hover:bg-white'
                      }`}
                    >
                      <span className="mt-0.5">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notePinned"
                  checked={notePinned}
                  onChange={(e) => setNotePinned(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                />
                <label htmlFor="notePinned" className="text-[12px] font-medium text-on-surface">
                  📌 Pin this mindful note to the top of the space
                </label>
              </div>
            </div>
          )}

          {/* 3. DEADLINE FORM */}
          {activeType === 'deadline' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Deadline Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Presentation & Slide Submission"
                  value={deadlineTitle}
                  onChange={(e) => setDeadlineTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:border-[#B85C7A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDueDate}
                  onChange={(e) => setDeadlineDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-[13px] text-on-surface focus:border-[#B85C7A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">Time <span className="font-normal text-outline">(optional)</span></label>
                <input type="time" value={deadlineDueTime} onChange={(e) => setDeadlineDueTime(e.target.value)} className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-[13px] text-on-surface focus:border-[#B85C7A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20 shadow-inner" />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Additional Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Submission portal link, guidelines, or requirements..."
                  value={deadlineDescription}
                  onChange={(e) => setDeadlineDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-[13px] text-on-surface placeholder:text-outline focus:border-[#B85C7A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B85C7A]/20 shadow-inner resize-none"
                />
              </div>
            </div>
          )}

          {/* 4. RESOURCE FORM */}
          {activeType === 'resource' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syllabus, API Documentation, or Drive Folder"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as ResourceType)}
                    className="w-full rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2.5 text-[13px] text-on-surface focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner"
                  >
                    <option value="Link">🔗 Web Link</option>
                    <option value="PDF/reference">📄 PDF / Reference</option>
                    <option value="Other">📁 Other Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                    URL / Web Address
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    className="w-full rounded-2xl border border-white/80 bg-white/70 px-3.5 py-2 text-[13px] text-on-surface placeholder:text-outline focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key chapters, access credentials, or notes..."
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-[13px] text-on-surface placeholder:text-outline focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-inner resize-none"
                />
              </div>
            </div>
          )}

          {/* Space Assignment */}
          <div className="pt-1">
            <SpaceSelector
              label="Assigned Space"
              value={selectedSpaceId}
              onChange={setSelectedSpaceId}
              allowNoSpace={true}
            />
          </div>

          {submitError && (
            <p role="alert" className="text-xs font-medium text-red-700">
              {submitError}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full px-5 py-2.5 text-[12px] font-semibold text-outline hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="berry-button rounded-full px-6 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : activeType === 'note' ? 'Save Mindful Note' : activeType === 'task' ? 'Add Task' : activeType === 'deadline' ? 'Add Deadline' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
