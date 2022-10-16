import { Lexer } from '../lexer';
import { TokenKind } from '../token';

test('basic test', () => {
  const input = `{}()!?`;

  const lexer = new Lexer(input);

  expect(lexer.token.kind).toEqual(TokenKind.SOF);
  expect(lexOne(lexer)).toEqual({
    column: 1,
    end: 1,
    kind: TokenKind.BRACE_L,
    line: 1,
    start: 0,
  });
  expect(lexOne(lexer)).toEqual({ column: 2, end: 2, kind: TokenKind.BRACE_R, line: 1, start: 1 });
  expect(lexOne(lexer)).toEqual({ column: 3, end: 3, kind: TokenKind.PAREN_L, line: 1, start: 2 });
  expect(lexOne(lexer)).toEqual({ column: 4, end: 4, kind: TokenKind.PAREN_R, line: 1, start: 3 });
  expect(lexOne(lexer)).toEqual({ column: 5, end: 5, kind: TokenKind.BANG, line: 1, start: 4 });
  expect(lexOne(lexer)).toEqual({
    column: 6,
    end: 6,
    kind: TokenKind.QUESTION_MARK,
    line: 1,
    start: 5,
  });
  expect(lexOne(lexer)).toEqual({ column: 7, end: 6, kind: TokenKind.EOF, line: 1, start: 6 });
  expect(lexOne(lexer)).toEqual({ column: 7, end: 6, kind: TokenKind.EOF, line: 1, start: 6 });
});

test('lexer handles whitespaces', () => {
  const input = `{}  ()   !?`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    column: 1,
    end: 1,
    kind: TokenKind.BRACE_L,
    line: 1,
    start: 0,
  });
  expect(lexOne(lexer)).toEqual({ column: 2, end: 2, kind: TokenKind.BRACE_R, line: 1, start: 1 });
  expect(lexOne(lexer)).toEqual({ column: 5, end: 5, kind: TokenKind.PAREN_L, line: 1, start: 4 });
  expect(lexOne(lexer)).toEqual({ column: 6, end: 6, kind: TokenKind.PAREN_R, line: 1, start: 5 });
  expect(lexOne(lexer)).toEqual({ column: 10, end: 10, kind: TokenKind.BANG, line: 1, start: 9 });
  expect(lexOne(lexer)).toEqual({
    column: 11,
    end: 11,
    kind: TokenKind.QUESTION_MARK,
    line: 1,
    start: 10,
  });
});

test('lexer handles new line', () => {
  const input = `{}\n ()`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    column: 1,
    end: 1,
    kind: TokenKind.BRACE_L,
    line: 1,
    start: 0,
  });
  expect(lexOne(lexer)).toEqual({ column: 2, end: 2, kind: TokenKind.BRACE_R, line: 1, start: 1 });
  expect(lexOne(lexer)).toEqual({ column: 2, end: 5, kind: TokenKind.PAREN_L, line: 2, start: 4 });
  expect(lexOne(lexer)).toEqual({ column: 3, end: 6, kind: TokenKind.PAREN_R, line: 2, start: 5 });
});

test('lexer handles numbers', () => {
  const input = `-1 1.2 -1.2 2`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.INT,
    value: '-1',
    start: 0,
    end: 2,
    line: 1,
    column: 1,
  });
  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.FLOAT,
    value: '1.2',
    start: 3,
    end: 6,
    line: 1,
    column: 4,
  });
  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.FLOAT,
    value: '-1.2',
    start: 7,
    end: 11,
    line: 1,
    column: 8,
  });
  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.INT,
    value: '2',
    start: 12,
    end: 13,
    line: 1,
    column: 13,
  });
});

test('handle leading zeroes', () => {
  const input = `0000`;

  const lexer = new Lexer(input);

  expect(() => lexer.advance()).toThrowError(/Invalid number, unexpected digit after 0/);
});

test('handle numbers with letters', () => {
  const input = `1a`;

  const lexer = new Lexer(input);

  expect(() => lexer.advance()).toThrowError(/Invalid number, expected digit but got/);
});

test('handle names', () => {
  const input = `_random_String`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.NAME,
    value: '_random_String',
    start: 0,
    end: 14,
    line: 1,
    column: 1,
  });
});

test('handles strings', () => {
  const input = `"random string"`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.STRING,
    value: 'random string',
    start: 0,
    end: 15,
    line: 1,
    column: 1,
  });
});

test('it throws an error in unterminated string', () => {
  const input = `"random string`;

  const lexer = new Lexer(input);

  expect(() => lexOne(lexer)).toThrowError(/Unterminated string/);
});

test('handles multiline strings', () => {
  const input = `"random string"`;

  const lexer = new Lexer(input);

  expect(lexOne(lexer)).toEqual({
    kind: TokenKind.STRING,
    value: 'random string',
    start: 0,
    end: 15,
    line: 1,
    column: 1,
  });
});

test('handles block strings', () => {
  expect(lexOneFromString('""""""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 6,
    line: 1,
    column: 1,
    value: '',
  });

  expect(lexOneFromString('"""simple"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 12,
    line: 1,
    column: 1,
    value: 'simple',
  });

  expect(lexOneFromString('""" white space """')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 19,
    line: 1,
    column: 1,
    value: ' white space ',
  });

  expect(lexOneFromString('"""contains " quote"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 22,
    line: 1,
    column: 1,
    value: 'contains " quote',
  });

  expect(lexOneFromString('"""contains \\""" triple quote"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 32,
    line: 1,
    column: 1,
    value: 'contains """ triple quote',
  });

  expect(lexOneFromString('"""multi\nline"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 16,
    line: 1,
    column: 1,
    value: 'multi\nline',
  });

  expect(lexOneFromString('"""multi\rline\r\nnormalized"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 28,
    line: 1,
    column: 1,
    value: 'multi\nline\nnormalized',
  });

  expect(lexOneFromString('"""unescaped \\n\\r\\b\\t\\f\\u1234"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 32,
    line: 1,
    column: 1,
    value: 'unescaped \\n\\r\\b\\t\\f\\u1234',
  });

  expect(lexOneFromString('"""unescaped unicode outside BMP \u{1f600}"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 38,
    line: 1,
    column: 1,
    value: 'unescaped unicode outside BMP \u{1f600}',
  });

  expect(lexOneFromString('"""slashes \\\\ \\/"""')).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 19,
    line: 1,
    column: 1,
    value: 'slashes \\\\ \\/',
  });

  expect(
    lexOneFromString(`"""

      spans
        multiple
          lines

      """`),
  ).toEqual({
    kind: TokenKind.BLOCK_STRING,
    start: 0,
    end: 60,
    line: 1,
    column: 1,
    value: 'spans\n  multiple\n    lines',
  });
});

test('advance line after lexing multiline block string', () => {
  expect(
    lexSecondFromString(`"""

      spans
        multiple
          lines

      \n """ second_token`),
  ).toEqual({
    kind: TokenKind.NAME,
    start: 63,
    end: 75,
    line: 8,
    column: 6,
    value: 'second_token',
  });

  expect(
    lexSecondFromString(
      ['""" \n', 'spans \r\n', 'multiple \n\r', 'lines \n\n', '"""\n second_token'].join(''),
    ),
  ).toEqual({
    kind: TokenKind.NAME,
    start: 37,
    end: 49,
    line: 8,
    column: 2,
    value: 'second_token',
  });
});

function lexOne(lexer: Lexer) {
  return lexer.advance().toJSON();
}

function lexOneFromString(input: string) {
  const lexer = new Lexer(input);
  return lexer.advance().toJSON();
}

function lexSecondFromString(input: string) {
  const lexer = new Lexer(input);
  lexer.advance();
  return lexer.advance().toJSON();
}
