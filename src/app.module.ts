import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { GqlModule } from './gql/gql.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, GqlModule],
  providers: [],
})
export class AppModule {}
