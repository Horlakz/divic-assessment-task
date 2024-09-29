import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput extends LoginInput {
  @Field({ nullable: true })
  biometricKey?: string;
}
