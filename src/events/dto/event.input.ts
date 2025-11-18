import { EventStatus } from '@/generated/graphql';
import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

@InputType()
export class EventFilterInput {
  @Field(() => EventStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTimeFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTimeTo?: Date;
}

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  take?: number = 20;

  @Field(() => Number, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  skip?: number = 0;
}
