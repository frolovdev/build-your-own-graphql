import { Lexer } from '../lexer';
import { TokenKind } from '../token';

test('lexer works', () => {
  const input = `{}()!?`;

  const lexer = new Lexer(input);

  expect(lexer.token.kind).toEqual(TokenKind.SOF);
  expect(lexer.advance().kind).toEqual(TokenKind.BRACE_L);
  expect(lexer.advance().kind).toEqual(TokenKind.BRACE_R);
  expect(lexer.advance().kind).toEqual(TokenKind.PAREN_L);
  expect(lexer.advance().kind).toEqual(TokenKind.PAREN_R);
  expect(lexer.advance().kind).toEqual(TokenKind.BANG);
  expect(lexer.advance().kind).toEqual(TokenKind.QUESTION_MARK);
  expect(lexer.advance().kind).toEqual(TokenKind.EOF);
  expect(lexer.advance().kind).toEqual(TokenKind.EOF);
});
