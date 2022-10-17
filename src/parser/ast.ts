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
