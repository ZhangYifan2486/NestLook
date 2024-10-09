// 用于提取 HTTP 请求中的 dataScope 属性，获取与用户相关的 SQL 作用域信息，其注入到控制器或服务的方法参数中
// createParamDecorator 是 NestJS 提供的一个工具函数，用于创建自定义的参数装饰器，
// 允许开发者从请求上下文中提取数据，并将其传递到控制器或服务方法的参数中。
// ExecutionContext 提供对当前请求上下文的访问。在 HTTP 请求中，它允许你获取原始请求对象（如 Express 中的 req 对象），从而提取所需信息。
// 假设你在某个请求中注入了 dataScope，这个值可以用于限定用户的数据库查询范围或权限。
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DataScopeSql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.dataScope;
  },
);
