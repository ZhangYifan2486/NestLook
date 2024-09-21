/**
 * 角色权限验证：从 Redis 中获取用户的角色，检查用户是否具备访问某个资源的角色权限。
 * Redis 缓存角色：使用 Redis 存储和读取用户的角色列表，通过用户的 userId 从 Redis 中获取用户的角色数组。
 * 元数据读取：使用 Reflector 从方法或类上读取角色元数据，通过装饰器设置角色权限要求。
 * 逻辑验证：支持两种验证逻辑：OR 和 AND，分别表示用户只需具备任意一个角色或必须具备所有角色才能访问资源。
 * */
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY_METADATA } from '../contants/decorator.contant';
import { USER_ROLEKEYS_KEY } from '../contants/redis.contant';
import { RoleObj } from '../decorators/requires-roles.decorator';
import { LogicalEnum } from '../enums/logical.enum';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roleObj = this.reflector.getAllAndOverride<RoleObj>(
      ROLES_KEY_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!roleObj || !roleObj.roleArr.length) return true;
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    // 从redis获取角色信息
    const userRoleArr = JSON.parse(
      await this.redis.get(`${USER_ROLEKEYS_KEY}:${userId}`),
    );
    if (userRoleArr.includes('admin')) return true;
    let result = false;

    if (roleObj.logical === LogicalEnum.or) {
      result = roleObj.roleArr.some((userPermission) => {
        return userRoleArr.includes(userPermission);
      });
    } else if (roleObj.logical === LogicalEnum.and) {
      result = roleObj.roleArr.every((userPermission) => {
        return userRoleArr.includes(userPermission);
      });
    }
    if (!result) throw new ApiException('暂无权限访问，请联系管理员');
    return result;
  }
}
