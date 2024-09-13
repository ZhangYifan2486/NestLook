import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY_METADATA } from '../contants/decorator.contant';
import { LogicalEnum } from '../enums/logical.enum';
// 存储角色数组和角色间的逻辑关系
export type RoleObj = {
  roleArr: string[];
  logical: LogicalEnum;
};
// 设置角色标识
// 在守卫中使用 Reflector：通过 Reflector 从处理器函数或类中读取元数据。
export const RequiresRoles = (
  roles: string | string[],
  logical: LogicalEnum = LogicalEnum.or,
) => {
  let roleObj: RoleObj = {
    roleArr: [],
    logical,
  };
  if (typeof roles === 'string') {
    roleObj = {
      roleArr: [roles],
      logical,
    };
  } else if (roles instanceof Array) {
    roleObj = {
      roleArr: roles,
      logical,
    };
  }
  return SetMetadata(ROLES_KEY_METADATA, roleObj);
};
