// src/utils/getCaretCoordinates.ts

/**
 * Calculates the (x, y) coordinates of the text cursor within an input or textarea element.
 * @param element The input or textarea element.
 * @param position The character index of the cursor.
 * @returns The { x, y } coordinates relative to the viewport.
 */
export function getCaretCoordinates(
  element: HTMLInputElement | HTMLTextAreaElement,
  position: number
): { x: number; y: number } {
  const mirrorDiv = document.createElement("div");
  document.body.appendChild(mirrorDiv);

  const style = mirrorDiv.style;
  const computed = getComputedStyle(element);

  // Copy all essential styles from the element to the mirror div
  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word"; // Crucial for textarea wrapping
  style.position = "absolute";
  style.visibility = "hidden";
  style.overflow = "hidden"; // Don't show scrollbars

  // Copy font, padding, border, and box-sizing properties
  [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "textTransform",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "boxSizing",
  ].forEach((prop) => {
    (style as any)[prop] = (computed as any)[prop];
  });

  // Position the mirror div exactly behind the original element
  const rect = element.getBoundingClientRect();
  style.top = `${element.offsetTop}px`;
  style.left = `${element.offsetLeft}px`;
  style.width = `${element.clientWidth}px`; // Use clientWidth to exclude borders
  style.height = `${element.clientHeight}px`;

  // Set the content of the mirror div to the text before the cursor
  mirrorDiv.textContent = element.value.substring(0, position);

  // Create a span and append it to the mirror div. The position of this span
  // will be the exact position of the cursor.
  const span = document.createElement("span");
  span.textContent = "."; // Use a non-empty, zero-width character or a dot for measurement
  mirrorDiv.appendChild(span);

  // Get the position of the span relative to the viewport
  const spanRect = span.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // Clean up by removing the mirror div
  document.body.removeChild(mirrorDiv);

  // The final coordinates are the bottom-left of the span.
  // We add the element's scroll position to handle scrolled textareas.
  return {
    x: spanRect.left + element.scrollLeft,
    y: spanRect.top + spanRect.height + element.scrollTop, // Position it below the line of text
  };
}
