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

function lexOne(lexer: Lexer) {
  return lexer.advance().toJSON();
}
