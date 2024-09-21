/**
 * 使用用户的 userId 作为 Redis 缓存的键，获取用户的角色信息和部门 ID。
 * 角色信息包含了用户的 roleKey 和 dataScope，用于判断用户的数据权限范围。
 * 如果用户是超级管理员 (roleKey == 'admin')，则用户具有所有数据权限，直接返回，不进行数据范围限制。
 *
 * 对于非超级管理员，根据用户每个角色的 dataScope 属性生成对应的 SQL 查询条件。数据范围分为：
 * 全部数据权限：无条件查询所有数据。
 * 自定义数据权限：根据角色自定义的部门权限查询数据。
 * 本部门数据权限：限制为用户所在部门的数据。
 * 本部门及以下数据权限：用户部门及子部门的数据。
 * 仅本人数据权限：仅限于用户自己的数据。
 * 生成的 SQL 条件存储在 request.dataScope 中，供后续数据库查询使用。
 * */
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { concat, Observable } from 'rxjs';
import { Role } from 'src/modules/system/role/entities/role.entity';
import { DATASCOPE_KEY_METADATA } from '../contants/decorator.contant';
import { USER_DEPTID_KEY, USER_ROLEKS_KEY } from '../contants/redis.contant';
import { DeptOrUserAlias } from '../decorators/datascope.decorator';

@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取当前controller上的元数据
    const aliaObj: DeptOrUserAlias = this.reflector.get(
      DATASCOPE_KEY_METADATA,
      context.getHandler(),
    );
    if (aliaObj) {
      const request = context.switchToHttp().getRequest();
      return concat(this.setDataScope(request, aliaObj), next.handle());
    } else {
      return next.handle();
    }
  }

  /* 获取数据权限 */
  async setDataScope(request, aliaObj: DeptOrUserAlias) {
    const { userId } = request.user;
    let sqlString = '';
    /* 如果是超级管理员 ，就具备所有权限 */
    const roleArr: Role[] = JSON.parse(
      await this.redis.get(`${USER_ROLEKS_KEY}:${userId}`),
    );
    if (!roleArr.map((role) => role.roleKey).includes('admin')) {
      const userDeptId = await this.redis.get(`${USER_DEPTID_KEY}:${userId}`);
      const deptId = userDeptId ? userDeptId : null;
      for (let index = 0; index < roleArr.length; index++) {
        const role = roleArr[index];
        const dataScope = role.dataScope;
        if (dataScope == '1') {
          //全部数据权限
          sqlString = '';
          return;
        } else if (dataScope == '2') {
          //自定义数据权限
          sqlString += ` OR ${aliaObj.deptAlias}.dept_id IN ( SELECT deptDeptId FROM role_depts_dept WHERE roleRoleId = ${role.roleId} )`;
        } else if (dataScope == '3') {
          //本部门数据权限
          sqlString += ` OR ${aliaObj.deptAlias}.dept_id = ${deptId}`;
        } else if (dataScope == '4') {
          //本部门及以下数据权限
          sqlString += ` OR ${aliaObj.deptAlias}.dept_id IN ( SELECT dept_id FROM dept WHERE concat('.',mpath) like '%.${deptId}.%')`;
        } else if (dataScope == '5') {
          //仅本人数据权限
          sqlString += ` OR ${aliaObj.userAlias}.user_id = ${userId}`;
        }
      }
    }
    if (sqlString) {
      request.dataScope = '(' + sqlString.substring(4) + ')';
    }
  }
}
