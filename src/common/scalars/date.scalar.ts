import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/**
 * A custom GraphQL scalar type to handle JavaScript `Date` objects.
 *
 * This scalar serializes `Date` instances to Unix timestamps (milliseconds),
 * and parses incoming values (both variable-based and inline) as timestamps into `Date` objects.
 */
@Scalar('Date', (_type) => Date)
export class DateScalar implements CustomScalar<number, Date> {
  /**
   * Description of the custom scalar, shown in the GraphQL schema documentation.
   */
  description = 'Date custom scalar type';

  /**
   * Parses a value sent by the client through GraphQL variables.
   *
   * @param value - A Unix timestamp (in milliseconds).
   * @returns A JavaScript `Date` object.
   */
  parseValue(value: number): Date {
    return new Date(value);
  }

  /**
   * Serializes a `Date` object to a Unix timestamp (in milliseconds) to send to the client.
   *
   * @param value - A JavaScript `Date` object.
   * @returns A numeric Unix timestamp (in milliseconds).
   */
  serialize(value: Date): number {
    return value.getTime();
  }

  /**
   * Parses a hardcoded literal value from a GraphQL query.
   *
   * If the literal is an integer (Unix timestamp in milliseconds), it will convert it to a `Date`.
   * Otherwise, it throws an error indicating the expected format.
   *
   * @param ast - A GraphQL AST node representing the literal.
   * @returns A JavaScript `Date` object.
   * @throws Will throw an error if the AST node kind is not `INT`.
   */
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    throw new Error(`Invalid AST kind for Date: expected INT, got ${ast.kind}`);
  }
}
