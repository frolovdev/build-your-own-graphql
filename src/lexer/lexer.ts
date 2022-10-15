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

      // digit or - sign
      if (isDigit(code) || code === 0x002d) {
        return this.readNumber(position, code);
      }

      throw syntaxError(`Invalid character: ${this.printCodePointAt(position)}.`);
    }

    return this.createToken(TokenKind.EOF, bodyLength, bodyLength);
  }

  readNumber(start: number, firstCode: number): Token {
    let position = start;
    let code = firstCode;
    let isFloat = false;

    // NegativeSign (-)
    if (code === 0x002d) {
      code = this.input.charCodeAt(++position);
    }

    // Zero (0)
    if (code === 0x0030) {
      code = this.input.charCodeAt(++position);
      if (isDigit(code)) {
        throw syntaxError(
          `Invalid number, unexpected digit after 0: ${this.printCodePointAt(position)}.`,
        );
      }
    } else {
      position = this.readDigits(position, code);
      code = this.input.charCodeAt(position);
    }

    // Full stop (.)
    if (code === 0x002e) {
      isFloat = true;

      code = this.input.charCodeAt(++position);
      position = this.readDigits(position, code);
      code = this.input.charCodeAt(position);
    }

    // Numbers cannot be followed by . or NameStart
    if (code === 0x002e || isNameStart(code)) {
      throw syntaxError(
        `Invalid number, expected digit but got: ${this.printCodePointAt(position)}.`,
      );
    }

    return this.createToken(
      isFloat ? TokenKind.FLOAT : TokenKind.INT,
      start,
      position,
      this.input.slice(start, position),
    );
  }

  /**
   * Returns the new position in the source after reading one or more digits.
   */
  readDigits(start: number, firstCode: number): number {
    if (!isDigit(firstCode)) {
      throw syntaxError(`Invalid number, expected digit but got: ${this.printCodePointAt(start)}.`);
    }

    let position = start + 1; // +1 to skip first firstCode

    while (isDigit(this.input.charCodeAt(position))) {
      ++position;
    }

    return position;
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

export function isDigit(code: number): boolean {
  return code >= 0x0030 && code <= 0x0039;
}

/**
 * ```
 * Letter :: one of
 *   - `A` `B` `C` `D` `E` `F` `G` `H` `I` `J` `K` `L` `M`
 *   - `N` `O` `P` `Q` `R` `S` `T` `U` `V` `W` `X` `Y` `Z`
 *   - `a` `b` `c` `d` `e` `f` `g` `h` `i` `j` `k` `l` `m`
 *   - `n` `o` `p` `q` `r` `s` `t` `u` `v` `w` `x` `y` `z`
 * ```
 */
export function isLetter(code: number): boolean {
  return (
    (code >= 0x0061 && code <= 0x007a) || // A-Z
    (code >= 0x0041 && code <= 0x005a) // a-z
  );
}

/**
 * ```
 * NameStart ::
 *   - Letter
 *   - `_`
 * ```
 */
export function isNameStart(code: number): boolean {
  return isLetter(code) || code === 0x005f;
}
