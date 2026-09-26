import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return {
        bg: 'bg-primary/15 text-primary border-primary/30',
        dot: 'bg-primary',
      };
    case 'high':
      return {
        bg: 'bg-[#ff7e67]/15 text-[#ff7e67] border-[#ff7e67]/30',
        dot: 'bg-[#ff7e67]',
      };
    case 'medium':
      return {
        bg: 'bg-[#e83d84]/15 text-[#e83d84] border-[#e83d84]/30',
        dot: 'bg-[#e83d84]',
      };
    case 'low':
    default:
      return {
        bg: 'bg-white/70 text-outline border-white/80',
        dot: 'bg-outline',
      };
  }
}

export function getSpaceColorClasses(color: string) {
  switch (color) {
    case 'primary':
    case 'rose':
    case 'emerald':
    case 'indigo':
    default:
      return {
        bg: 'bg-white/60 text-on-surface border-white/80',
        badge: 'bg-primary/15 text-primary border border-primary/20',
        ring: 'text-primary',
      };
  }
}

export function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
