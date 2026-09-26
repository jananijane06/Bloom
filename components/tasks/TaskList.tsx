'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Task } from '@/types/task';
import { Space } from '@/types/space';
import { cn } from '@/lib/utils';
import { KanbanStatus, TaskCard } from './TaskCard';

export interface TaskListProps {
  tasks: Task[];
  spaces: Space[];
  onChangeStatus: (id: string, status: KanbanStatus) => void;
  onDelete?: (id: string) => void;
  filterSpaceId?: string;
  statusError?: string | null;
  savingTaskIds?: Set<string>;
}

const COLUMNS: {
  status: KanbanStatus;
  title: string;
  empty: string;
  tint: string;
  marker: string;
}[] = [
  {
    status: 'todo',
    title: 'To do',
    empty: 'Nothing waiting here.',
    tint: 'bg-[#F8E3E8]/65',
    marker: 'bg-[#D9829B]',
  },
  {
    status: 'in_progress',
    title: 'In progress',
    empty: 'Nothing currently in progress.',
    tint: 'bg-[#E9A6B8]/35',
    marker: 'bg-[#8E3159]',
  },
  {
    status: 'completed',
    title: 'Done',
    empty: 'No completed tasks yet.',
    tint: 'bg-[#FFF9F7]/75',
    marker: 'bg-[#B85C7A]',
  },
];

function statusFor(task: Task): KanbanStatus | 'archived' {
  if (task.status === 'archived') return 'archived';
  if (task.completed || task.status === 'completed') return 'completed';
  if (task.status === 'in_progress') return 'in_progress';
  return 'todo';
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  spaces,
  onChangeStatus,
  onDelete,
  filterSpaceId,
  statusError,
  savingTaskIds = new Set<string>(),
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const spacesMap = useMemo(() => new Map(spaces.map((space) => [space.id, space.name])), [spaces]);

  const spaceTasks = useMemo(() => tasks.filter((task) => {
    const taskSpaceId = task.space_id ?? null;
    if (!filterSpaceId || filterSpaceId === 'all') return true;
    if (filterSpaceId === 'none' || filterSpaceId === 'no-space') return !taskSpaceId;
    return taskSpaceId === filterSpaceId;
  }), [tasks, filterSpaceId]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return spaceTasks.filter((task) => {
      const status = statusFor(task);
      if (status === 'archived') return false;
      if (filterTab === 'pending' && status === 'completed') return false;
      if (filterTab === 'completed' && status !== 'completed') return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query) ?? false;
        const matchesTag = task.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false;
        if (!matchesTitle && !matchesDescription && !matchesTag) return false;
      }

      return true;
    });
  }, [spaceTasks, filterTab, priorityFilter, searchQuery]);

  const groupedTasks = useMemo(() => {
    const groups: Record<KanbanStatus, Task[]> = {
      todo: [],
      in_progress: [],
      completed: [],
    };
    for (const task of filteredTasks) {
      const status = statusFor(task);
      if (status !== 'archived') groups[status].push(task);
    }
    return groups;
  }, [filteredTasks]);

  const scopedCounts = {
    all: spaceTasks.filter((task) => statusFor(task) !== 'archived').length,
    pending: spaceTasks.filter((task) => {
      const status = statusFor(task);
      return status !== 'archived' && status !== 'completed';
    }).length,
    completed: spaceTasks.filter((task) => statusFor(task) === 'completed').length,
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>, status: KanbanStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId) return;
    const task = tasks.find((item) => item.id === taskId);
    if (!task || statusFor(task) === status || statusFor(task) === 'archived') return;
    onChangeStatus(taskId, status);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#967783]" />
          <input
            type="search"
            placeholder="Search tasks, notes, or tags..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-full border border-white/85 bg-white/60 py-2.5 pl-10 pr-4 text-[13px] text-[#351A26] shadow-sm outline-none backdrop-blur-xl transition placeholder:text-[#967783] focus:border-[#B85C7A]/40 focus:bg-white/90 focus:ring-2 focus:ring-[#B85C7A]/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/85 bg-white/55 p-1 shadow-sm backdrop-blur-xl">
            {(['all', 'pending', 'completed'] as const).map((tab) => {
              const label = tab === 'completed' ? 'Done' : tab === 'pending' ? 'Pending' : 'All';
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[11px] font-medium transition',
                    filterTab === tab ? 'bg-[#5A1835] text-white shadow-sm' : 'text-[#684653] hover:bg-white/70'
                  )}
                >
                  {label} <span className="ml-0.5 opacity-75">{scopedCounts[tab]}</span>
                </button>
              );
            })}
          </div>

          <label className="sr-only" htmlFor="task-priority-filter">Filter by priority</label>
          <select
            id="task-priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-full border border-white/85 bg-white/60 px-3.5 py-2 text-[11px] font-medium text-[#684653] shadow-sm outline-none backdrop-blur-xl focus:border-[#B85C7A]/40"
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {statusError && (
        <p role="alert" className="rounded-2xl border border-[#B85C7A]/25 bg-[#F8E3E8]/75 px-4 py-3 text-[12px] text-[#701F43]">
          {statusError}
        </p>
      )}

      <div className="overflow-x-auto pb-2 md:-mx-1 md:px-1">
        <div className="grid grid-cols-1 gap-4 md:min-w-[816px] md:grid-cols-3 xl:min-w-0">
          {COLUMNS.map((column) => {
            const columnTasks = groupedTasks[column.status];
            return (
              <section
                key={column.status}
                aria-label={`${column.title}, ${columnTasks.length} tasks`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, column.status)}
                className={cn(
                  'flex min-h-[300px] flex-col rounded-[26px] border border-white/75 p-3.5 shadow-[0_12px_32px_rgba(90,24,53,0.035)] backdrop-blur-xl transition-colors',
                  column.tint,
                  draggedTaskId && 'ring-1 ring-inset ring-[#B85C7A]/15'
                )}
              >
                <header className="mb-3 flex items-center justify-between px-1.5 py-1">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('h-2 w-2 rounded-full', column.marker)} />
                    <h2 className="text-[13px] font-semibold text-[#351A26]">{column.title}</h2>
                  </div>
                  <span className="metadata rounded-full border border-white/75 bg-white/50 px-2.5 py-1 text-[10px] text-[#684653]">
                    {String(columnTasks.length).padStart(2, '0')} tasks
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-2.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex min-h-[190px] flex-1 items-center justify-center rounded-[20px] border border-dashed border-[#B85C7A]/20 bg-white/20 px-4 text-center">
                      <p className="editorial text-[17px] text-[#967783]">{column.empty}</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        status={column.status}
                        spaceName={task.space_id ? spacesMap.get(task.space_id) : undefined}
                        onChangeStatus={onChangeStatus}
                        onDelete={onDelete}
                        onDragStart={setDraggedTaskId}
                        onDragEnd={() => setDraggedTaskId(null)}
                        isDragging={draggedTaskId === task.id}
                        isSaving={savingTaskIds.has(task.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
