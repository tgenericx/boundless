import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GqlModule } from './gql/gql.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GqlModule,
    UsersModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
