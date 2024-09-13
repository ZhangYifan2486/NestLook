// 判断是否为开发环境，并进行限制

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class DemoEnvironmentGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 判断nest.js环境是否为开发环境
    const isDemoEnvironment =
      this.configService.get<boolean>('isDemoEnvironment');
    if (!isDemoEnvironment) return true;
    // 获取请求头
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];
    if (!authorization) return true;
    // userId为1则不限制
    const payload = await this.jwtService.verify(authorization.slice(7));
    if (+payload?.userId === -1) return true;
    // === end
    // const allowUrlArr = [
    //   '/login',
    //   '/logout',
    //   '/web/user/login',
    //   '/web/user/reg',
    //   '/user-collect',
    //   '/user-rate',
    //   '/user-movie',
    // ]; //放过的路由
    // if (
    //   request.method.toLocaleLowerCase() != 'get' &&
    //   !allowUrlArr.includes(request.url)
    // )
    //   throw new ApiException('演示环境,不允许操作');
    return true;
  }
}
