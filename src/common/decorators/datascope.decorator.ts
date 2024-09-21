// SetMetadata 是 NestJS 提供的装饰器，用于将自定义的元数据附加到类、方法、属性上。在这里，它的作用是将 DeptOrUserAlias 对象作为元数据存储，供拦截器、守卫等后续逻辑使用。
// DataScope 装饰器的设计目的是为某些数据作用域的操作（如部门或用户级别的过滤）提供别名映射，常见于权限系统、报表系统或数据分析场景。
// 附加部门以及用户
import { SetMetadata } from '@nestjs/common';
import { DATASCOPE_KEY_METADATA } from '../contants/decorator.contant';

export class DeptOrUserAlias {
  deptAlias?: string = 'dept';
  userAlias?: string = 'user';
}
// 设置别名
export const DataScope = (deptOrUserAlias?: DeptOrUserAlias) => {
  const aliaObj = Object.assign(new DeptOrUserAlias(), deptOrUserAlias);
  return SetMetadata(DATASCOPE_KEY_METADATA, aliaObj);
};
