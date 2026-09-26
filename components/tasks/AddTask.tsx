'use client';

import React, { useEffect, useState } from 'react';
import { Task, Priority } from '@/types/task';
import { Space } from '@/types/space';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SpaceSelector } from '@/components/spaces/SpaceSelector';
import { useAuth } from '@/components/auth/AuthProvider';
import { createTask } from '@/lib/tasks';
import { Plus, Calendar, Clock, Tag } from 'lucide-react';

export interface AddTaskProps {
  spaces: Space[];
  onAddTask: (task: Task) => void;
  isOpen?: boolean;
  onClose?: () => void;
  defaultSpaceId?: string | null;
  defaultDueDate?: string | null;
}

export const AddTask: React.FC<AddTaskProps> = ({
  spaces,
  onAddTask,
  isOpen = false,
  onClose,
  defaultSpaceId,
  defaultDueDate,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [spaceId, setSpaceId] = useState<string | null>(
    defaultSpaceId ?? null
  );
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(defaultDueDate || '');
  const [dueTime, setDueTime] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep the selected Space and DueDate in sync when AddTask is opened
  useEffect(() => {
    setSpaceId(defaultSpaceId ?? null);
  }, [defaultSpaceId]);

  useEffect(() => {
    if (defaultDueDate) {
      setDueDate(defaultDueDate);
    }
  }, [defaultDueDate]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSpaceId(defaultSpaceId ?? null);
    setPriority('medium');
    setDueDate(defaultDueDate || '');
    setDueTime('');
    setTagInput('');
    setEstimatedMinutes(30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) return;

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const tags = tagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const created = await createTask(
        {
          title: title.trim(),
          description: description.trim() || null,

          completed: false,
          status: 'todo',

          priority,

          // Space relationship
          space_id: spaceId,

          // Calendar/due information
          due_date: dueDate || null,
          due_time: dueTime || null,

          tags,
          estimated_minutes: estimatedMinutes,
        },
        user?.id || null
      );

      onAddTask(created);

      resetForm();

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      setSubmitError(
        error instanceof Error
          ? `Task was not saved: ${error.message}`
          : 'Task was not saved. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* =========================
          TITLE
      ========================= */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
          Task Title *
        </label>

        <input
          type="text"
          placeholder="e.g. Finish OSI revision"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </div>


      {/* =========================
          DESCRIPTION
      ========================= */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
          Description
        </label>

        <textarea
          placeholder="Add any intentions, notes, or details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-sm"
        />
      </div>


      {/* =========================
          SPACE + PRIORITY
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Space */}
        <div>
          <SpaceSelector
            label="Space"
            value={spaceId}
            onChange={setSpaceId}
            spaces={spaces}
            allowNoSpace={true}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as Priority)
            }
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          >
            <option value="low">
              Low priority
            </option>

            <option value="medium">
              Medium priority
            </option>

            <option value="high">
              High priority
            </option>

            <option value="urgent">
              🔥 Urgent Priority
            </option>
          </select>
        </div>

      </div>


      {/* =========================
          DATE + TIME + ESTIMATE
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Due Date */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Due Date
            </span>
            <span className="text-[10px] text-primary/80 font-medium normal-case">
              (adds to calendar)
            </span>
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>


        {/* Due Time */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Time
          </label>

          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>


        {/* Estimated Minutes */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5 flex items-center gap-1">
            Minutes
          </label>

          <input
            type="number"
            min={5}
            step={5}
            value={estimatedMinutes}
            onChange={(e) =>
              setEstimatedMinutes(Number(e.target.value))
            }
            className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

      </div>


      {/* =========================
          TAGS
      ========================= */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-primary" />
          Tags
        </label>

        <input
          type="text"
          placeholder="Study, Assignment, Exam"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
        />

        <p className="text-[10px] text-outline mt-1">
          Separate multiple tags with commas.
        </p>
      </div>


      {/* =========================
          ACTIONS
      ========================= */}
      <div className="flex items-center justify-end gap-2 pt-2">

        {submitError && (
          <p role="alert" className="mr-auto text-xs font-medium text-red-700">
            {submitError}
          </p>
        )}

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !title.trim()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {isSubmitting ? 'Planting...' : 'Plant Task'}
        </Button>

      </div>

    </form>
  );


  /* =========================
      MODAL VERSION
  ========================= */

  if (isOpen && onClose) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Plant a New Task"
        description="Cultivate your sanctuary with intention."
      >
        {formContent}
      </Modal>
    );
  }


  /* =========================
      INLINE VERSION
  ========================= */

  return (
    <div className="glass-card p-5 rounded-[28px] border border-white/80">

      <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">
          add_circle
        </span>

        Plant a New Task
      </h3>

      {formContent}

    </div>
  );
};

export default AddTask;
