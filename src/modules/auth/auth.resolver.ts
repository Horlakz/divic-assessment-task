import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginInput, RegisterInput } from './auth.args';
import { Login, Register } from './auth.entity';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => Register)
  register(@Args('data') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => Login)
  login(@Args('data') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => Login)
  loginWithBiometrics(@Args('key') key: string) {
    return this.authService.loginWithBiometrics(key);
  }

  // @Mutation(() => Auth)
  // createAuth(@Args('createAuthInput') createAuthInput: CreateAuthInput) {
  //   return this.authService.create(createAuthInput);
  // }

  // @Query(() => [Auth], { name: 'auth' })
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Query(() => Auth, { name: 'auth' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.findOne(id);
  // }

  // @Mutation(() => Auth)
  // updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
  //   return this.authService.update(updateAuthInput.id, updateAuthInput);
  // }

  // @Mutation(() => Auth)
  // removeAuth(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.remove(id);
  // }
}
