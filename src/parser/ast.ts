import { Token } from '../lexer/token';

export class Location {
  /**
   * The character offset at which this Node begins.
   */
  readonly start: number;

  /**
   * The character offset at which this Node ends.
   */
  readonly end: number;

  /**
   * The Token at which this Node begins.
   */
  readonly startToken: Token;

  /**
   * The Token at which this Node ends.
   */
  readonly endToken: Token;

  /**
   * The Source document the AST represents.
   */
  readonly source: string;

  constructor(startToken: Token, endToken: Token, source: string) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }

  get [Symbol.toStringTag]() {
    return 'Location';
  }

  toJSON(): { start: number; end: number } {
    return { start: this.start, end: this.end };
  }
}

export enum Kind {
  NAME = 'Name',
  DOCUMENT = 'Document',
}

export interface NameNode {
  readonly kind: Kind.NAME;
  readonly value: string;
}

export interface DocumentNode {
  readonly kind: Kind.DOCUMENT;
  readonly definitions: ReadonlyArray<DefinitionNode>;
}

export type DefinitionNode =
  | ExecutableDefinitionNode
  | TypeSystemDefinitionNode
  | TypeSystemExtensionNode;

export type ExecutableDefinitionNode = OperationDefinitionNode | FragmentDefinitionNode;

export type TypeSystemDefinitionNode =
  | SchemaDefinitionNode
  | TypeDefinitionNode
  | DirectiveDefinitionNode;

export type TypeSystemExtensionNode = SchemaExtensionNode | TypeExtensionNode;
