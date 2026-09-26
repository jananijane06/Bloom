const ALLOWED_TAGS = new Set([
  'A', 'BLOCKQUOTE', 'BR', 'CODE', 'EM', 'H1', 'H2', 'H3', 'HR', 'I', 'LI',
  'OL', 'P', 'PRE', 'S', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD',
  'TR', 'U', 'UL',
]);

const FORMATTED_TAG_PATTERN = /<\/?(?:a|blockquote|br|code|em|h[1-3]|hr|i|li|ol|p|pre|s|strong|table|tbody|td|th|thead|tr|u|ul)(?:\s|>)/i;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeHref(value: string): boolean {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return true;
  return trimmed.startsWith('/') || trimmed.startsWith('#');
}

/** Convert legacy plain descriptions to paragraphs and sanitize saved editor HTML. */
export function sanitizeCourseInformationHtml(value: string): string {
  const source = FORMATTED_TAG_PATTERN.test(value)
    ? value
    : value.split(/\r?\n/).map((line) => `<p>${line ? escapeHtml(line) : '<br>'}</p>`).join('');
  if (typeof DOMParser === 'undefined') return source.replace(/<[^>]*>/g, ' ');
  const document = new DOMParser().parseFromString(source, 'text/html');

  const cleanNode = (parent: Node) => {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as HTMLElement;
      if (!ALLOWED_TAGS.has(element.tagName)) {
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH'].includes(element.tagName)) {
          element.remove();
        } else {
          const movedChildren = Array.from(element.childNodes);
          element.replaceWith(...movedChildren);
          movedChildren.forEach(cleanNode);
        }
        return;
      }

      const href = element.tagName === 'A' ? element.getAttribute('href') : null;
      const alignment = element.getAttribute('style')?.match(/text-align\s*:\s*(left|center|right|justify)/i)?.[1];
      Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
      if (href && safeHref(href)) {
        element.setAttribute('href', href);
        element.setAttribute('rel', 'noopener noreferrer');
        element.setAttribute('target', '_blank');
      }
      if (alignment && ['P', 'H1', 'H2', 'H3'].includes(element.tagName)) {
        element.style.textAlign = alignment.toLowerCase();
      }
      cleanNode(element);
    });
  };

  cleanNode(document.body);
  return document.body.innerHTML;
}

export function getCourseInformationText(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<\/(?:p|h[1-6]|li|tr|blockquote|pre)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}
