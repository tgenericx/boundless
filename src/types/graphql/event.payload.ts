import { ObjectType, Field } from '@nestjs/graphql';

/**
 * Creates a reusable event payload class for any entity.
 *
 * @param name The GraphQL name of the payload (e.g., "BusinessEventPayload")
 * @param entityClass The class reference for the GraphQL model
 */
export function createEventPayload<T extends new (...args: any[]) => any>(
  name: string,
  entityClass: T,
) {
  @ObjectType(name)
  class EventPayload {
    @Field()
    type: 'CREATED' | 'UPDATED' | 'REMOVED';

    @Field(() => entityClass)
    payload: InstanceType<T>;
  }

  return EventPayload;
}
