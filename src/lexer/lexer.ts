import { syntaxError } from '../error/syntaxError';
import { Token, TokenKind } from './token';

export class Lexer {
  /**
   * input string
   */
  input: string;
  /**
   * The previously focused non-ignored token.
   */
  lastToken: Token;

  /**
   * The currently focused non-ignored token.
   */
  token: Token;

  /**
   * The (1-indexed) line containing the current token.
   */
  line: number;

  /**
   * The character offset at which the current line begins.
   */
  lineStart: number;

  constructor(input: string) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);

    this.input = input;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }

  advance() {
    this.lastToken = this.token;
    this.token = this.lookahead();
    return this.token;
  }

  /**
   * Looks ahead and returns the next non-ignored token, but does not change
   * the state of Lexer.
   */
  lookahead(): Token {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      if (token.next) {
        token = token.next;
      } else {
        // Read the next token and form a link in the token linked-list.
        const nextToken = this.readNextToken(token.end);
        // @ts-expect-error next is only mutable during parsing.
        token.next = nextToken;
        // @ts-expect-error prev is only mutable during parsing.
        nextToken.prev = token;
        token = nextToken;
      }
    }
    return token;
  }

  /**
   * Gets the next token from the source starting at the given position.
   *
   * This skips over whitespace until it finds the next lexable token, then lexes
   * punctuators immediately or calls the appropriate helper function for more
   * complicated tokens.
   */
  readNextToken(start: number): Token {
    const body = this.input;
    const bodyLength = body.length;
    let position = start;

    while (position < bodyLength) {
      const code = body.charCodeAt(position);

      // SourceCharacter
      switch (code) {
        case 0x0020: // <space>
          ++position;
          continue;

        case 0x000a: // \n
          ++position;
          ++this.line;
          this.lineStart = position;
          continue;
        case 0x0021: // !
          return this.createToken(TokenKind.BANG, position, position + 1);
        case 0x0024: // $
          return this.createToken(TokenKind.DOLLAR, position, position + 1);
        case 0x0026: // &
          return this.createToken(TokenKind.AMP, position, position + 1);
        case 0x0028: // (
          return this.createToken(TokenKind.PAREN_L, position, position + 1);
        case 0x0029: // )
          return this.createToken(TokenKind.PAREN_R, position, position + 1);
        case 0x002e: // .
          if (
            body.charCodeAt(position + 1) === 0x002e &&
            body.charCodeAt(position + 2) === 0x002e
          ) {
            return this.createToken(TokenKind.SPREAD, position, position + 3);
          }
          break;
        case 0x003a: // :
          return this.createToken(TokenKind.COLON, position, position + 1);
        case 0x003d: // =
          return this.createToken(TokenKind.EQUALS, position, position + 1);
        case 0x0040: // @
          return this.createToken(TokenKind.AT, position, position + 1);
        case 0x005b: // [
          return this.createToken(TokenKind.BRACKET_L, position, position + 1);
        case 0x005d: // ]
          return this.createToken(TokenKind.BRACKET_R, position, position + 1);
        case 0x007b: // {
          return this.createToken(TokenKind.BRACE_L, position, position + 1);
        case 0x007c: // |
          return this.createToken(TokenKind.PIPE, position, position + 1);
        case 0x007d: // }
          return this.createToken(TokenKind.BRACE_R, position, position + 1);
        case 0x003f: // ?
          return this.createToken(TokenKind.QUESTION_MARK, position, position + 1);
      }

      throw syntaxError(`Invalid character: ${this.printCodePointAt(position)}.`);
    }

    return this.createToken(TokenKind.EOF, bodyLength, bodyLength);
  }

  /**
   * Create a token with line and column location information.
   */
  createToken(kind: TokenKind, start: number, end: number, value?: string): Token {
    const line = this.line;
    const col = 1 + start - this.lineStart;
    return new Token(kind, start, end, line, col, value);
  }

  printCodePointAt(position: number): string {
    const code = this.input.codePointAt(position);

    if (code === undefined) {
      return TokenKind.EOF;
    }

    const char = String.fromCodePoint(code);
    return char === '"' ? "'\"'" : `"${char}"`;
  }
}
