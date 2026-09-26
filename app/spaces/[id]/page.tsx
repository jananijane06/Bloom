'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { SpaceHeader } from '@/components/spaces/SpaceHeader';
import { SpaceProgress } from '@/components/spaces/SpaceProgress';
import { SpaceStats } from '@/components/spaces/SpaceStats';
import { SpaceTabs, SpaceTabType } from '@/components/spaces/SpaceTabs';
import { EditSpaceModal } from '@/components/spaces/EditSpaceModal';
import { AddItemModal } from '@/components/spaces/AddItemModal';
import { TaskList } from '@/components/spaces/TaskList';
import { MindfulNoteList } from '@/components/spaces/MindfulNoteList';
import { DeadlineList } from '@/components/spaces/DeadlineList';
import { ResourceList } from '@/components/spaces/ResourceList';
import { UpcomingList } from '@/components/spaces/UpcomingList';
import { CourseInformationSection } from '@/components/spaces/CourseInformationSection';

import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchSpaceById,
  updateSpace,
  deleteSpace,
  uploadSpaceImage,
  removeSpaceImage,
} from '@/lib/spaces';
import {
  fetchSpaceTasks,
  updateSpaceTask,
  deleteSpaceTask,
  fetchSpaceNotes,
  updateSpaceNote,
  deleteSpaceNote,
  fetchSpaceDeadlines,
  updateSpaceDeadline,
  deleteSpaceDeadline,
  fetchSpaceResources,
  updateSpaceResource,
  deleteSpaceResource,
} from '@/lib/spaceItems';
import { Space } from '@/types/space';
import {
  SpaceTask,
  MindfulNote,
  Deadline,
  Resource,
  AddItemType,
} from '@/types/spaceItems';

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  // Space metadata state
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab & modal navigation state
  const [activeTab, setActiveTab] = useState<SpaceTabType>('upcoming');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<AddItemType>('task');

  // Space Items real data
  const [tasks, setTasks] = useState<SpaceTask[]>([]);
  const [notes, setNotes] = useState<MindfulNote[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Load space and all nested entities
  const loadAllSpaceData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [foundSpace, spaceTasks, spaceNotes, spaceDeadlines, spaceResources] =
        await Promise.all([
          fetchSpaceById(id, user?.id),
          fetchSpaceTasks(id, user?.id).catch((e) => {
            console.warn('Failed to load space tasks:', e);
            return [];
          }),
          fetchSpaceNotes(id, user?.id).catch((e) => {
            console.warn('Failed to load space notes:', e);
            return [];
          }),
          fetchSpaceDeadlines(id, user?.id).catch((e) => {
            console.warn('Failed to load space deadlines:', e);
            return [];
          }),
          fetchSpaceResources(id, user?.id).catch((e) => {
            console.warn('Failed to load space resources:', e);
            return [];
          }),
        ]);

      setSpace(foundSpace);
      setTasks(spaceTasks || []);
      setNotes(spaceNotes || []);
      setDeadlines(spaceDeadlines || []);
      setResources(spaceResources || []);
    } catch (err) {
      console.error('Error loading space data:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadAllSpaceData();
  }, [loadAllSpaceData]);

  // Derived metrics
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const upcomingDeadlinesCount = deadlines.length;

  // Open Add Modal pre-selecting category matching current tab
  const handleOpenAddModal = (overrideType?: AddItemType) => {
    if (overrideType) {
      setAddType(overrideType);
    } else {
      if (activeTab === 'notes') setAddType('note');
      else if (activeTab === 'deadlines') setAddType('deadline');
      else if (activeTab === 'resources') setAddType('resource');
      else setAddType('task');
    }
    setIsAddOpen(true);
  };

  // --------------------------------------------------------------------------
  // TASK HANDLERS (immediate state updates)
  // --------------------------------------------------------------------------
  const handleToggleTaskComplete = async (task: SpaceTask) => {
    const updatedStatus = !task.completed;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      await updateSpaceTask(
        task.id,
        { completed: updatedStatus },
        id,
        user?.id
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    }
  };

  const handleUpdateTask = async (task: SpaceTask) => {
    try {
      const savedTask = await updateSpaceTask(task.id, task, id, user?.id);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? savedTask : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteSpaceTask(taskId, id, user?.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleTaskCreated = (newTask: SpaceTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // --------------------------------------------------------------------------
  // MINDFUL NOTES HANDLERS
  // --------------------------------------------------------------------------
  const handleToggleNotePin = async (note: MindfulNote) => {
    const updatedPinned = !note.pinned;
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === note.id ? { ...n, pinned: updatedPinned } : n
      );
      return updated.sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
    });

    try {
      await updateSpaceNote(note.id, { pinned: updatedPinned }, id, user?.id);
    } catch (err) {
      console.error('Failed to pin note:', err);
    }
  };

  const handleUpdateNote = async (note: MindfulNote) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    try {
      await updateSpaceNote(note.id, note, id, user?.id);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await deleteSpaceNote(noteId, id, user?.id);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleNoteCreated = (newNote: MindfulNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  // --------------------------------------------------------------------------
  // DEADLINE HANDLERS
  // --------------------------------------------------------------------------
  const handleUpdateDeadline = async (deadline: Deadline) => {
    setDeadlines((prev) => prev.map((d) => (d.id === deadline.id ? deadline : d)));
    try {
      await updateSpaceDeadline(deadline.id, deadline, id, user?.id);
    } catch (err) {
      console.error('Failed to update deadline:', err);
    }
  };

  const handleDeleteDeadline = async (deadlineId: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));
    try {
      await deleteSpaceDeadline(deadlineId, id, user?.id);
    } catch (err) {
      console.error('Failed to delete deadline:', err);
    }
  };

  const handleDeadlineCreated = (newDeadline: Deadline) => {
    setDeadlines((prev) =>
      [...prev, newDeadline].sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
    );
  };

  // --------------------------------------------------------------------------
  // RESOURCE HANDLERS
  // --------------------------------------------------------------------------
  const handleUpdateResource = async (resource: Resource) => {
    setResources((prev) => prev.map((r) => (r.id === resource.id ? resource : r)));
    try {
      await updateSpaceResource(resource.id, resource, id, user?.id);
    } catch (err) {
      console.error('Failed to update resource:', err);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    try {
      await deleteSpaceResource(resourceId, id, user?.id);
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const handleResourceCreated = (newResource: Resource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  // --------------------------------------------------------------------------
  // SPACE SETTINGS & DELETE
  // --------------------------------------------------------------------------
  const handleUpdateSpace = async (spaceId: string, updates: Partial<Space>) => {
    const updated = await updateSpace(spaceId, updates, user?.id);
    setSpace(updated);
  };

  const handleChangeSpaceImage = async (file: File) => {
    if (!space) return;
    const updated = await uploadSpaceImage(space, file, user?.id);
    setSpace(updated);
  };

  const handleRemoveSpaceImage = async () => {
    if (!space) return;
    const updated = await removeSpaceImage(space, user?.id);
    setSpace(updated);
  };

  const handleDeleteSpace = async (spaceId: string) => {
    await deleteSpace(spaceId, user?.id);
    router.push('/spaces');
  };

  // Loading state
  if (loading) {
    return (
      <AppShell>
        <div className="sanctuary-bg min-h-[calc(100vh-64px)] p-6 lg:p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            <p className="text-[12px] text-outline font-medium">Opening your sanctuary space...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Not found fallback
  if (!space) {
    return (
      <AppShell>
        <div className="sanctuary-bg min-h-[calc(100vh-64px)] p-6 lg:p-8 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 rounded-[32px] text-center border border-white/80 shadow-md">
            <span className="material-symbols-outlined text-[36px] text-primary mb-2">
              sentiment_dissatisfied
            </span>
            <h2 className="text-[18px] font-bold text-on-surface">Space Not Found</h2>
            <p className="text-[13px] text-on-surface-variant mt-1">
              This sanctuary workspace may have been relocated or removed.
            </p>
            <div className="mt-5">
              <Link
                href="/spaces"
                className="berry-button inline-flex items-center gap-2 rounded-full py-2.5 px-6 text-[12px] font-semibold text-white shadow-sm"
              >
                <span>Back to Spaces</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Ambient background glows */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6 sm:space-y-8">
          {/* ================================================================
              1. SPACE HEADER
              (icon, Space name, description, Add Item, Settings)
              ================================================================ */}
          <SpaceHeader
            space={space}
            hideDescription
            onEdit={() => setIsEditOpen(true)}
            onChangeImage={handleChangeSpaceImage}
            onRemoveImage={handleRemoveSpaceImage}
          />

          <CourseInformationSection
            content={space.description ?? ''}
            onSave={async (html) => { await handleUpdateSpace(id, { description: html }); }}
          />

          {/* ================================================================
              2. LARGE SPACE PROGRESS HERO CARD
              (Circular SVG progress ring, dynamic Supabase calculation,
               horizontal progress bar, completed/remaining/deadline stats)
              ================================================================ */}
          <SpaceProgress
            completedTasks={completedTasksCount}
            totalTasks={totalTasksCount}
            upcomingDeadlinesCount={upcomingDeadlinesCount}
          />

          {/* ================================================================
              3. STATISTIC CARDS (4-card grid with live counts)
              (Focus Tasks, Mindful Notes, Upcoming Deadlines, Saved Resources)
              ================================================================ */}
          <SpaceStats
            taskCount={totalTasksCount}
            noteCount={notes.length}
            deadlinesCount={upcomingDeadlinesCount}
            resourceCount={resources.length}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as SpaceTabType)}
          />

          {/* ================================================================
              4. TABS NAVIGATION
              (Upcoming, Tasks, Mindful Notes, Resources, Deadlines)
              ================================================================ */}
          <div className="space-y-5">
            <SpaceTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              taskCount={totalTasksCount}
              noteCount={notes.length}
              deadlineCount={upcomingDeadlinesCount}
              resourceCount={resources.length}
            />

            {/* ==============================================================
                5. FUNCTIONAL TAB CONTENT
                ============================================================== */}
            <div className="pt-1">
              {/* UPCOMING TAB */}
              {activeTab === 'upcoming' && (
                <UpcomingList
                  tasks={tasks}
                  deadlines={deadlines}
                  onToggleTaskComplete={handleToggleTaskComplete}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onUpdateDeadline={handleUpdateDeadline}
                  onDeleteDeadline={handleDeleteDeadline}
                  onAddItem={() => handleOpenAddModal()}
                />
              )}

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <TaskList
                  tasks={tasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onAddTask={() => handleOpenAddModal('task')}
                />
              )}

              {/* MINDFUL NOTES TAB */}
              {activeTab === 'notes' && (
                <MindfulNoteList
                  notes={notes}
                  onTogglePin={handleToggleNotePin}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  onAddNote={() => handleOpenAddModal('note')}
                />
              )}

              {/* RESOURCES TAB */}
              {activeTab === 'resources' && (
                <ResourceList
                  resources={resources}
                  onUpdate={handleUpdateResource}
                  onDelete={handleDeleteResource}
                  onAddResource={() => handleOpenAddModal('resource')}
                />
              )}

              {/* DEADLINES TAB */}
              {activeTab === 'deadlines' && (
                <DeadlineList
                  deadlines={deadlines}
                  onUpdate={handleUpdateDeadline}
                  onDelete={handleDeleteDeadline}
                  onAddDeadline={() => handleOpenAddModal('deadline')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        spaceId={id}
        userId={user?.id}
        initialType={addType}
        onTaskCreated={handleTaskCreated}
        onNoteCreated={handleNoteCreated}
        onDeadlineCreated={handleDeadlineCreated}
        onResourceCreated={handleResourceCreated}
      />

      {/* EDIT SPACE SETTINGS MODAL */}
      <EditSpaceModal
        space={space}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateSpace}
        onDelete={handleDeleteSpace}
      />
    </AppShell>
  );
}
