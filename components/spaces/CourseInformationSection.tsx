'use client';

import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, BookOpen, ChevronDown, Code2,
  Italic, Link as LinkIcon, List, ListOrdered, Plus, Redo2, Table2, Underline,
  Undo2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getCourseInformationText, sanitizeCourseInformationHtml } from '@/lib/courseInformation';

interface CourseInformationSectionProps {
  content: string;
  onSave: (html: string) => Promise<void>;
}

const EDITOR_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  TableKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

export function CourseInformationSection({ content, onSave }: CourseInformationSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const preview = getCourseInformationText(content);
  const firstLine = preview.split(/(?<=[.!?])\s|\n/)[0]?.trim();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EDITOR_EXTENSIONS,
    content: sanitizeCourseInformationHtml(draft),
    editorProps: {
      attributes: {
        class: 'course-rich-content min-h-48 px-4 py-3 text-sm leading-relaxed text-on-surface outline-none',
        'aria-label': 'Course information editor',
      },
    },
    onUpdate: ({ editor: currentEditor }) => setDraft(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (!editing) setDraft(content);
  }, [content, editing]);

  const openEditor = () => {
    setDraft(content);
    editor?.commands.setContent(sanitizeCourseInformationHtml(content));
    setError('');
    setExpanded(true);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(content);
    editor?.commands.setContent(sanitizeCourseInformationHtml(content));
    setError('');
    if (content.trim()) setEditing(false);
    else {
      setEditing(false);
      setExpanded(false);
    }
  };

  const save = async () => {
    if (!editor || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(editor.isEmpty ? '' : editor.getHTML());
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your course information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Enter a web address', previous ?? 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const normalized = /^(https?:|mailto:|tel:|\/|#)/i.test(href.trim()) ? href.trim() : `https://${href.trim()}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
  };

  const toggleExpanded = () => {
    if (!expanded) {
      setDraft(content);
      editor?.commands.setContent(sanitizeCourseInformationHtml(content));
      setError('');
      setEditing(false);
      setExpanded(true);
    } else if (!saving) {
      setExpanded(false);
      setEditing(false);
      setDraft(content);
      editor?.commands.setContent(sanitizeCourseInformationHtml(content));
      setError('');
    }
  };

  return (
    <GlassCard className="border border-white/80 bg-white/45 shadow-sm backdrop-blur-2xl">
      <button type="button" onClick={toggleExpanded} aria-expanded={expanded} className="group w-full text-left">
        <span className="flex items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 to-[#F3C7D2]/45 text-[#8E3159] shadow-sm">
              <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="editorial-label block text-[9px] text-[#967783]">YOUR NOTES</span>
              <span className="mt-0.5 block truncate font-serif text-xl text-on-surface transition-colors group-hover:text-primary">Course Information</span>
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/55 text-primary shadow-sm transition group-hover:bg-white">
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </span>
        </span>
        {!expanded && (
          <span className="mt-3 flex items-start gap-3 rounded-2xl border border-white/80 bg-gradient-to-r from-[#FFF9F7]/85 via-white/55 to-[#F8E3E8]/40 px-3.5 py-3 shadow-inner sm:ml-[52px] sm:px-4">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B85C7A]/70 ring-4 ring-[#B85C7A]/10" />
            <span className={`line-clamp-2 min-w-0 text-left leading-relaxed ${firstLine ? 'font-serif text-[14px] text-[#684653]' : 'text-xs text-outline'}`}>
              {firstLine || 'Lecturer details, assessment notes, room information, and things to remember.'}
            </span>
          </span>
        )}
      </button>

      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${expanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          {editing ? (
            <>
              <div className="rounded-2xl border border-white/85 bg-white/60 shadow-inner">
                <div className="flex flex-wrap items-center gap-1 border-b border-white/80 bg-white/45 p-2" role="toolbar" aria-label="Text formatting">
                  <FormatButton label="Bold" active={!!editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold /></FormatButton>
                  <FormatButton label="Italic" active={!!editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic /></FormatButton>
                  <FormatButton label="Underline" active={!!editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline /></FormatButton>
                  <span className="mx-1 h-5 border-l border-[#B85C7A]/20" />
                  <select
                    aria-label="Text style"
                    value={editor?.isActive('heading', { level: 1 }) ? 'h1' : editor?.isActive('heading', { level: 2 }) ? 'h2' : editor?.isActive('heading', { level: 3 }) ? 'h3' : 'paragraph'}
                    onChange={(event) => {
                      const level = Number(event.target.value.slice(1)) as 1 | 2 | 3;
                      const chain = editor?.chain().focus();
                      if (event.target.value === 'paragraph') chain?.setParagraph().run();
                      else chain?.toggleHeading({ level }).run();
                    }}
                    className="h-8 rounded-lg border border-white/70 bg-white/55 px-2 text-[11px] text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="paragraph">Text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option>
                  </select>
                  <FormatButton label="Bullet list" active={!!editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List /></FormatButton>
                  <FormatButton label="Numbered list" active={!!editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered /></FormatButton>
                  <FormatButton label="Inline code" active={!!editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 /></FormatButton>
                  <span className="mx-1 h-5 border-l border-[#B85C7A]/20" />
                  <FormatButton label="Align left" onClick={() => editor?.chain().focus().setTextAlign('left').run()}><AlignLeft /></FormatButton>
                  <FormatButton label="Align center" onClick={() => editor?.chain().focus().setTextAlign('center').run()}><AlignCenter /></FormatButton>
                  <FormatButton label="Align right" onClick={() => editor?.chain().focus().setTextAlign('right').run()}><AlignRight /></FormatButton>
                  <FormatButton label="Add link" active={!!editor?.isActive('link')} onClick={addLink}><LinkIcon /></FormatButton>
                  <FormatButton label="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></FormatButton>
                  <span className="mx-1 h-5 border-l border-[#B85C7A]/20" />
                  <FormatButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}><Undo2 /></FormatButton>
                  <FormatButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}><Redo2 /></FormatButton>
                </div>
                <div className="max-h-[55vh] min-h-48 overflow-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>
              {error && <p role="alert" className="mt-2 text-xs text-primary">{error}</p>}
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" disabled={saving} onClick={cancelEditing} className="rounded-full px-4 py-2 text-xs text-on-surface-variant hover:bg-white/70 disabled:opacity-50">Cancel</button>
                <button type="button" disabled={!editor || saving} onClick={() => void save()} className="berry-button rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </>
          ) : (
            content.trim() ? (
              <div className="rounded-2xl border border-white/85 bg-gradient-to-br from-[#FFF9F7]/80 to-white/50 p-4 shadow-inner sm:p-6">
                <div className="border-l-2 border-[#B85C7A]/35 pl-4 sm:pl-5">
                  <div className="max-w-full overflow-x-auto">
                    <div className="course-rich-content text-sm leading-relaxed text-on-surface-variant" dangerouslySetInnerHTML={{ __html: sanitizeCourseInformationHtml(content) }} />
                  </div>
                </div>
                <div className="mt-5 flex justify-end border-t border-white/75 pt-3">
                  <button type="button" onClick={openEditor} className="rounded-full border border-white/90 bg-white/70 px-3.5 py-2 text-xs font-medium text-on-surface-variant shadow-sm transition hover:bg-white hover:text-primary">Edit information</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[#B85C7A]/25 bg-[#FFF9F7]/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-serif text-lg text-on-surface">A space for the useful details.</p>
                  <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">Keep lecturer details, assessment notes, room information, and things you want to remember here.</p>
                </div>
                <button type="button" onClick={openEditor} className="berry-button inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white shadow-sm">
                  <Plus className="h-3.5 w-3.5" /> Add information
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function FormatButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${active ? 'bg-primary/12 text-primary' : 'text-on-surface-variant hover:bg-white/80 hover:text-primary'}`}
    >
      {children}
    </button>
  );
}
