'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { TaskList } from '@/components/tasks/TaskList';
import { AddTask } from '@/components/tasks/AddTask';
import { SpaceSidebar } from '@/components/spaces/SpaceSidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchTasksFromSupabase, updateTaskStatusInDatabase, deleteTask } from '@/lib/tasks';
import { fetchUserSpaces } from '@/lib/spaces';
import { Task } from '@/types/task';
import { Space } from '@/types/space';
import { Plus } from 'lucide-react';
import type { KanbanStatus } from '@/components/tasks/TaskCard';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [savingTaskIds, setSavingTaskIds] = useState<Set<string>>(new Set());

  // Load user spaces and tasks
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedSpaces, loadedTasks] = await Promise.all([
        fetchUserSpaces(user?.id),
        fetchTasksFromSupabase(user?.id),
      ]);
      setSpaces(loadedSpaces);
      setTasks(loadedTasks);
      setBoardError(null);
    } catch (err) {
      console.error('Error loading tasks or spaces:', err);
      setBoardError(err instanceof Error ? err.message : 'Could not load your tasks.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist status moves to the existing Supabase row and roll back on failure.
  const handleChangeStatus = async (id: string, status: KanbanStatus) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || savingTaskIds.has(id)) return;

    const completed = status === 'completed';
    const optimisticTask: Task = {
      ...current,
      status,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };
    setBoardError(null);
    setSavingTaskIds((prev) => new Set(prev).add(id));
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? optimisticTask : task))
    );

    try {
      const saved = await updateTaskStatusInDatabase(id, status, user?.id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? saved : task))
      );
    } catch (err) {
      console.error('Failed to move task:', err);
      setBoardError(err instanceof Error ? err.message : 'Could not update this task. Please try again.');
      setTasks((prev) => prev.map((task) => (task.id === id ? current : task)));
    } finally {
      setSavingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id, user?.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Handle task added
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const activeSpace =
    selectedSpaceId === 'all'
      ? null
      : selectedSpaceId === 'none'
      ? { name: 'No Space / Personal' }
      : spaces.find((s) => s.id === selectedSpaceId);

  const pendingCount = tasks.filter(
    (task) => !task.completed && task.status !== 'completed' && task.status !== 'archived'
  ).length;

  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1500px] space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="editorial-label mb-2 text-primary">ONE THING AT A TIME</p>
              <div className="flex items-center gap-3">
                <h1 className="editorial text-4xl font-normal tracking-tight text-on-surface">
                  your tasks, in view
                </h1>
                <span className="metadata rounded-full border border-[#E9A6B8]/40 bg-white/55 px-3 py-1 text-[10px] text-[#684653]">
                  {pendingCount} open
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {activeSpace
                  ? `Filtered by space: ${activeSpace.name}`
                  : 'Your day, gently organised.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              Plant New Task
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 items-start xl:grid-cols-[230px_minmax(0,1fr)]">
            {/* Space filter */}
            <div className="min-w-0">
              <GlassCard className="p-4 rounded-[28px] border border-white/80 xl:sticky xl:top-6">
                <SpaceSidebar
                  spaces={spaces}
                  activeSpaceId={selectedSpaceId}
                  onSelectSpace={setSelectedSpaceId}
                />
              </GlassCard>
            </div>

            {/* Kanban board */}
            <div className="min-w-0 space-y-4">
              {loading ? (
                <div className="glass-card text-center py-16 rounded-[28px]">
                  <span className="h-7 w-7 border-2 border-primary/40 border-t-primary rounded-full animate-spin inline-block mb-2" />
                  <p className="text-[12px] text-outline">Loading your focus actions...</p>
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  spaces={spaces}
                  filterSpaceId={selectedSpaceId}
                  onChangeStatus={handleChangeStatus}
                  onDelete={handleDeleteTask}
                  statusError={boardError}
                  savingTaskIds={savingTaskIds}
                />
              )}
            </div>
          </div>

          {/* Add Task Modal */}
          <AddTask
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            spaces={spaces}
            defaultSpaceId={
              selectedSpaceId !== 'all' && selectedSpaceId !== 'none'
                ? selectedSpaceId
                : null
            }
            onAddTask={handleAddTask}
          />
        </div>
      </div>
    </AppShell>
  );
}
