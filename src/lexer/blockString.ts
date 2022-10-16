export function dedentBlockStringLines(lines: ReadonlyArray<string>): Array<string> {
  let commonIndent = Number.MAX_SAFE_INTEGER;
  let firstNonEmptyLine = null;
  let lastNonEmptyLine = -1;

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const indent = leadingWhitespace(line);

    if (indent === line.length) {
      continue; // skip empty lines
    }

    firstNonEmptyLine = firstNonEmptyLine ?? i;
    lastNonEmptyLine = i;

    if (i !== 0 && indent < commonIndent) {
      commonIndent = indent;
    }
  }

  return (
    lines
      // Remove common indentation from all lines but first.
      .map((line, i) => (i === 0 ? line : line.slice(commonIndent)))
      // Remove leading and trailing blank lines.
      .slice(firstNonEmptyLine ?? 0, lastNonEmptyLine + 1)
  );
}

/**
 * ```
 * WhiteSpace ::
 *   - "Horizontal Tab (U+0009)"
 *   - "Space (U+0020)"
 * ```
 */
export function isWhiteSpace(code: number): boolean {
  return code === 0x0009 || code === 0x0020;
}

function leadingWhitespace(str: string): number {
  let i = 0;
  while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
    ++i;
  }
  return i;
}
