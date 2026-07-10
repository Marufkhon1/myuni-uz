import { useEffect, useRef } from "react";

const LINE_HEIGHT_PX = 24;

export default function ChatComposerTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  inputRef,
  className = "",
  minRows = 1,
  maxRows = 8,
  onFocus,
}) {
  const localRef = useRef(null);
  const ref = inputRef || localRef;

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    element.style.height = "auto";
    const maxHeight = maxRows * LINE_HEIGHT_PX;
    const nextHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${Math.max(nextHeight, minRows * LINE_HEIGHT_PX)}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxRows, minRows, ref]);

  function handleChange(event) {
    onChange(event);
    const element = ref.current;
    if (!element) {
      return;
    }
    element.style.height = "auto";
    const maxHeight = maxRows * LINE_HEIGHT_PX;
    const nextHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${Math.max(nextHeight, minRows * LINE_HEIGHT_PX)}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  function handleFocus(event) {
    onFocus?.(event);
    const thread = event.currentTarget.closest("[data-chat-thread]");
    const scroller = thread?.querySelector(".chat-messages-scroll");
    if (scroller) {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
      });
    }
  }

  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onFocus={handleFocus}
      placeholder={placeholder}
      enterKeyHint="send"
      className={
        "block w-full resize-none break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-6 outline-none " +
        className
      }
    />
  );
}
