// caret.ts
// Viewport coordinates of the caret in an <input> or <textarea>,
// measured with an off-screen mirror element.

const COPIED = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
  'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize',
] as const;

export interface CaretRect {
  top: number;
  left: number;
  height: number;
}

export const getCaretRect = (
  element: HTMLInputElement | HTMLTextAreaElement,
  position: number
): CaretRect => {
  const doc = element.ownerDocument;
  const computed = doc.defaultView!.getComputedStyle(element);
  const isInput = element.nodeName === 'INPUT';

  const mirror = doc.createElement('div');
  const style = mirror.style;
  for (const prop of COPIED) (style as any)[prop] = (computed as any)[prop];
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.top = '0';
  style.left = '-9999px';
  style.whiteSpace = isInput ? 'pre' : 'pre-wrap';
  style.wordWrap = isInput ? 'normal' : 'break-word';
  style.overflow = 'hidden';

  mirror.textContent = element.value.slice(0, position);
  const marker = doc.createElement('span');
  // A zero-width character keeps the span measurable at line ends
  marker.textContent = element.value.slice(position) || '​';
  mirror.appendChild(marker);
  doc.body.appendChild(mirror);

  const box = element.getBoundingClientRect();
  const px = (value: string) => parseFloat(value) || 0;
  const lineHeight = px(computed.lineHeight) || px(computed.fontSize) * 1.2 || 16;
  const rect = {
    top: box.top + marker.offsetTop + px(computed.borderTopWidth) - element.scrollTop,
    left: box.left + marker.offsetLeft + px(computed.borderLeftWidth) - element.scrollLeft,
    height: lineHeight,
  };
  doc.body.removeChild(mirror);
  return rect;
};
