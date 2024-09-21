/**
 * 这段代码定义了一个名为 UserInfoPipe 的自定义管道，
 * 它使用 Redis 来获取用户的相关信息（如用户名、昵称、部门ID和部门名称）。
 * 这个管道基于传递进来的参数元数据动态获取不同的用户信息，
 * 从而简化了控制器中的处理逻辑。该管道主要应用于处理需要获取用户信息的场景，如通过用户ID来获取用户名、昵称等。
 * */
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  USER_DEPTID_KEY,
  USER_DEPTNAME_KEY,
  USER_NICKNAME_KEY,
  USER_USERNAME_KEY,
} from '../contants/redis.contant';
import { UserEnum } from '../decorators/user.decorator';

@Injectable()
export class UserInfoPipe implements PipeTransform {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    const { data } = metadata;
    if (!data) return value;
    if (data === UserEnum.userId) return value;
    if (data === UserEnum.userName)
      return await this.redis.get(`${USER_USERNAME_KEY}:${value}`);
    if (data === UserEnum.nickName)
      return await this.redis.get(`${USER_NICKNAME_KEY}:${value}`);
    if (data === UserEnum.deptId)
      return await this.redis.get(`${USER_DEPTID_KEY}:${value}`);
    if (data === UserEnum.deptName)
      return await this.redis.get(`${USER_DEPTNAME_KEY}:${value}`);
  }
}
