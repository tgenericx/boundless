import { dbPrisma } from './db-prisma';

describe('dbPrisma', () => {
  it('should work', () => {
    expect(dbPrisma()).toEqual('db-prisma');
  });
});
