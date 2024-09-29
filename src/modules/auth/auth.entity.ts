import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Register {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Login {
  @Field()
  accessToken: string;
}
