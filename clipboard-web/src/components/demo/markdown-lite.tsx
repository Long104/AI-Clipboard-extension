"use client";

import * as React from "react";

export interface MarkdownLiteProps {
  text: string;
}

/**
 * Renders a markdown-lite string with zero dependencies.
 * Supported syntax:
 *   - lines starting with "- " become <li> inside a <ul>
 *   - **bold** becomes <strong>
 *   - whole lines of the form *(text)* become <em>
 *   - blank lines separate paragraphs
 * Content is our own canned strings, so no HTML escaping is needed and we
 * build React elements directly (no dangerouslySetInnerHTML).
 */
export function MarkdownLite({ text }: MarkdownLiteProps) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-4 space-y-1 my-2">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    blocks.push(
      <p key={key++} className="mb-2">
        {renderInline(line)}
      </p>,
    );
    i += 1;
  }

  return (
    <div className="text-[13px] leading-relaxed text-ink font-sans">{blocks}</div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** while keeping the delimiters.
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**") && segment.length >= 4) {
      return (
        <strong key={index} className="font-semibold">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    const italic = segment.match(/^\*\((.*)\)\*$/);
    if (italic) {
      return (
        <em key={index} className="italic">
          {italic[1]}
        </em>
      );
    }
    return <React.Fragment key={index}>{segment}</React.Fragment>;
  });
}
