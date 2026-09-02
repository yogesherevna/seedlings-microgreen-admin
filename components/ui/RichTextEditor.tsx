"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  minHeight = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value || "";
  }, [value]);

  function command(command: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="border rounded overflow-hidden seedlings-rich-editor">
      <div className="bg-body-tertiary border-bottom p-1 d-flex flex-wrap gap-1">
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Bold"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("bold")}>
          <strong>B</strong>
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Italic"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("italic")}>
          <em>I</em>
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Underline"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("underline")}>
          <u>U</u>
        </button>
        <select
          className="form-select form-select-sm"
          style={{ width: 105 }}
          defaultValue=""
          aria-label="Font size"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.value) command("fontSize", e.target.value);
            e.currentTarget.value = "";
          }}
        >
          <option value="">Font size</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Extra large</option>
          <option value="6">Huge</option>
        </select>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Bulleted list"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertUnorderedList")}>
          • List
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Numbered list"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertOrderedList")}>
          1. List
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Align left"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("justifyLeft")}>
          Left
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Align center"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("justifyCenter")}>
          Center
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" title="Clear formatting"
          onMouseDown={(e) => e.preventDefault()} onClick={() => command("removeFormat")}>
          Clear
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="p-2 bg-body"
        data-placeholder={placeholder}
        style={{ minHeight, outline: "none" }}
        onInput={handleInput}
        role="textbox"
        aria-multiline="true"
      />
      <style jsx>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: var(--bs-secondary-color);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
