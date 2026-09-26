import React from 'react';

export interface AuthMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export function AuthMessage({ type, message }: AuthMessageProps) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const containerStyle = isError
    ? 'border-[#B85C7A]/30 bg-[#B85C7A]/10 text-[#B85C7A]'
    : isSuccess
    ? 'border-[#701F43]/30 bg-[#701F43]/10 text-[#5A1835]'
    : 'border-rose-300/40 bg-rose-50/50 text-rose-800';

  const iconName = isError
    ? 'error'
    : isSuccess
    ? 'check_circle'
    : 'info';

  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-2.5 rounded-2xl border p-3.5 text-[12px] font-medium leading-snug animate-in fade-in duration-200 ${containerStyle}`}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
        {iconName}
      </span>
      <p className="flex-1">{message}</p>
    </div>
  );
}
