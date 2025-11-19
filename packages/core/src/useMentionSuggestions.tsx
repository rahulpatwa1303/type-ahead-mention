// useMentionSuggestions.ts

import { useState, useCallback, KeyboardEvent, useRef, useEffect } from "react";
import { getCaretPosition } from "get-caret-position";
import { createMentionsExtractor } from "./mention-helpers";
import { SuggestionPopper } from "./SuggestionPopper"; // Make sure this is imported
import { SuggestionNode } from "./suggestion-helpers";

// The virtual element that Popper.js can use for positioning
const virtualElement = {
  getBoundingClientRect: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
};

export const useMentionSuggestions = (
  initialValue: string,
  suggestionsData: SuggestionNode
) => {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [popperRef, setPopperRef] = useState<HTMLElement | null>(null);

  // This ref will hold the actual input/textarea DOM element
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const getSuggestions = createMentionsExtractor(suggestionsData);

  const updateSuggestions = (
    target: HTMLInputElement | HTMLTextAreaElement
  ) => {
    const { value, selectionStart } = target;
    if (selectionStart !== null) {
      const { suggestions: newSuggestions } = getSuggestions(
        value,
        selectionStart
      );
      setSuggestions(newSuggestions);
      setActiveIndex(0);

      // If we have suggestions, calculate cursor position and update the virtual element
      if (newSuggestions.length > 0) {
        const { top, left } = getCaretPosition(target);
        const height = 0; // Default height for cursor positioning
        virtualElement.getBoundingClientRect = () => ({
          width: 0,
          height,
          top: top,
          right: left,
          bottom: top + height,
          left: left,
        });
        // Force Popper.js to update
        setPopperRef(virtualElement as any);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(e.target.value);
    updateSuggestions(e.target);
  };

  const handleSelect = (suggestion: string) => {
    const { selectionStart } = inputRef.current!;
    const { trigger } = getSuggestions(value, selectionStart!);

    if (trigger === null) return;

    // Find where the trigger text starts
    const triggerStartIndex = value.lastIndexOf(trigger, selectionStart!);

    const textBefore = value.substring(0, triggerStartIndex);
    const textAfter = value.substring(selectionStart!);

    // Add the selected suggestion, followed by a space for better UX
    const newValue = `${textBefore}${suggestion} ${textAfter}`;

    setValue(newValue);
    setSuggestions([]);

    // We need to manually set the cursor position after the update
    setTimeout(() => {
      const newCursorPos = (textBefore + suggestion).length + 1;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
      }
    }
  };

  // This function will be called when the user clicks or uses arrow keys to move the cursor
  const handleCursorChange = (e: any) => {
    updateSuggestions(e.target);
  };

  const getInputProps = () => ({
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    // We need these to detect cursor changes from clicks or arrow keys
    onClick: handleCursorChange,
    onKeyUp: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        handleCursorChange(e);
      }
    },
    ref: inputRef, // Assign the ref to our internal ref
  });

  return {
    getInputProps,
    SuggestionPopper: (
      <SuggestionPopper
        suggestions={suggestions}
        onSelect={handleSelect}
        activeIndex={activeIndex}
        referenceElement={popperRef} // Use the state-managed ref
      />
    ),
  };
};
