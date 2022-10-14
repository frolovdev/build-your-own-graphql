import { GraphQLError } from './GraphQLError';

export function syntaxError(description: string): GraphQLError {
  return new GraphQLError(`Syntax Error: ${description}`);
}
