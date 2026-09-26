'use client';

import React, { RefObject, useState } from 'react';
import { Download, FileImage, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface TimetableExportActionsProps {
  desktopRef: RefObject<HTMLDivElement | null>;
  mobileRef: RefObject<HTMLDivElement | null>;
}

type ExportFormat = 'png' | 'pdf';
type ExportLayout = 'desktop' | 'phone';

export default function TimetableExportActions({ desktopRef, mobileRef }: TimetableExportActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState<`${ExportLayout}-${ExportFormat}` | null>(null);
  const [error, setError] = useState('');

  const exportTimetable = async (layout: ExportLayout, format: ExportFormat) => {
    const node = (layout === 'desktop' ? desktopRef : mobileRef).current;
    if (!node || busy) return;
    const action = `${layout}-${format}` as const;
    setBusy(action);
    setError('');
    try {
      const { toPng } = await import('html-to-image');
      const width = node.scrollWidth;
      const height = node.scrollHeight;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FFF9F7',
        width,
        height,
        // Export refs live far offscreen so they do not affect the visible
        // timetable. Reset that positioning on html-to-image's clone so the
        // phone layout is painted from the top-left of the resulting image.
        style: {
          position: 'relative',
          inset: 'auto',
          left: '0',
          top: '0',
          transform: 'none',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: 'none',
          overflow: 'visible',
        },
      });
      const title = layout === 'desktop' ? 'Desktop' : 'Phone';

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Bloom-Timetable-${title}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const image = new Image();
        image.src = dataUrl;
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Could not prepare the timetable image.'));
        });

        const imageWidthMm = image.width * 0.264583;
        const imageHeightMm = image.height * 0.264583;
        const isPhone = layout === 'phone';
        const pageWidth = isPhone ? 210 : 420;
        const pageHeight = isPhone ? Math.max(297, imageHeightMm + 24) : 297;
        const pdf = new jsPDF({ orientation: isPhone ? 'portrait' : 'landscape', unit: 'mm', format: isPhone ? [pageWidth, pageHeight] : 'a3' });
        const margin = 10;
        const scale = isPhone
          ? Math.min((pageWidth - margin * 2) / imageWidthMm, (pageHeight - margin * 2) / imageHeightMm)
          : (pageWidth - margin * 2) / imageWidthMm;
        const outputWidth = imageWidthMm * scale;
        const outputHeight = imageHeightMm * scale;
        if (isPhone) {
          pdf.addImage(dataUrl, 'PNG', (pageWidth - outputWidth) / 2, margin, outputWidth, outputHeight, undefined, 'FAST');
        } else {
          const printableHeight = pageHeight - margin * 2;
          const pageCount = Math.max(1, Math.ceil(outputHeight / printableHeight));
          for (let page = 0; page < pageCount; page += 1) {
            if (page > 0) pdf.addPage('a3', 'landscape');
            pdf.addImage(dataUrl, 'PNG', margin, margin - page * printableHeight, outputWidth, outputHeight, 'timetable', 'FAST');
          }
        }
        pdf.save(`Bloom-Timetable-${title}.pdf`);
      }
      setIsOpen(false);
    } catch {
      setError('Bloom could not prepare the download. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const isBusy = (layout: ExportLayout, format: ExportFormat) => busy === `${layout}-${format}`;

  return (
    <>
      <Button type="button" variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => { setIsOpen(true); setError(''); }} aria-label="Download timetable">
        Download
      </Button>
      <Modal isOpen={isOpen} onClose={() => !busy && setIsOpen(false)} title="Save your timetable ✦" description="Choose the layout you'd like to take with you." maxWidth="xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <section className="min-w-0 rounded-2xl border border-white/90 bg-white/55 p-4 shadow-sm">
            <div className="mb-3 overflow-hidden rounded-xl border border-white/90 bg-[#FFF9F7] p-2.5">
              <div className="grid grid-cols-7 gap-1 text-center text-[7px] font-medium text-[#684653]">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <div key={day} className="rounded bg-white/80 py-1">{day}</div>)}
                {Array.from({ length: 14 }, (_, index) => <div key={index} className={`h-5 rounded ${index % 4 === 1 ? 'bg-[#B85C7A]/25' : index % 7 === 2 ? 'bg-[#701F43]/15' : 'bg-white/60'}`} />)}
              </div>
            </div>
            <p className="font-serif text-lg text-[#351A26]">Desktop</p>
            <p className="mt-0.5 text-xs text-[#684653]">Full weekly timetable</p>
            <p className="mt-1.5 min-h-9 text-[11px] leading-relaxed text-[#967783]">Seven-day Bloom board, perfect for your laptop or desktop.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" disabled={!!busy} isLoading={isBusy('desktop', 'png')} leftIcon={!isBusy('desktop', 'png') ? <FileImage className="h-3.5 w-3.5" /> : undefined} onClick={() => void exportTimetable('desktop', 'png')}>Download Desktop</Button>
              <button type="button" disabled={!!busy} onClick={() => void exportTimetable('desktop', 'pdf')} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] text-[#684653] hover:bg-white/70 disabled:opacity-50"><FileText className="h-3.5 w-3.5" /> PDF</button>
            </div>
          </section>
          <section className="min-w-0 rounded-2xl border border-white/90 bg-white/55 p-4 shadow-sm">
            <div className="mb-3 flex h-[78px] gap-1.5 overflow-hidden rounded-xl border border-white/90 bg-[#FFF9F7] p-2">
              <div className="w-7 shrink-0 space-y-1 rounded-lg bg-white/70 p-1"><div className="h-2 rounded bg-[#701F43]/20" /><div className="h-2 rounded bg-[#B85C7A]/20" /><div className="h-2 rounded bg-[#701F43]/10" /></div>
              <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                {['Monday', 'Tuesday', 'Wednesday'].map((day, index) => <div key={day} className="flex h-[18px] items-center gap-1 rounded-md border border-white/80 bg-white/70 px-1"><span className="w-8 shrink-0 text-[6px] font-medium text-[#684653]">{day}</span><span className={`h-2 flex-1 rounded ${index === 1 ? 'bg-[#B85C7A]/25' : 'bg-[#701F43]/15'}`} /></div>)}
              </div>
            </div>
            <p className="font-serif text-lg text-[#351A26]">Phone</p>
            <p className="mt-0.5 text-xs text-[#684653]">Mobile timetable</p>
            <p className="mt-1.5 min-h-9 text-[11px] leading-relaxed text-[#967783]">Readable stacked timetable designed for your phone.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" disabled={!!busy} isLoading={isBusy('phone', 'png')} leftIcon={!isBusy('phone', 'png') ? <FileImage className="h-3.5 w-3.5" /> : undefined} onClick={() => void exportTimetable('phone', 'png')}>Download Phone</Button>
              <button type="button" disabled={!!busy} onClick={() => void exportTimetable('phone', 'pdf')} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] text-[#684653] hover:bg-white/70 disabled:opacity-50"><FileText className="h-3.5 w-3.5" /> PDF</button>
            </div>
          </section>
        </div>
        {busy && <p role="status" className="mt-4 text-center text-sm text-[#684653]">Bloom is preparing your timetable...</p>}
        {error && <p role="alert" className="mt-3 rounded-xl bg-[#B85C7A]/10 px-3 py-2 text-xs text-[#701F43]">{error}</p>}
      </Modal>
    </>
  );
}
