/**
 * 用于在请求成功后提取数据
 * */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
/**
 * Reflector：Nest.js 提供的反射工具，允许我们从控制器或处理器上获取元数据。
 * 在这个拦截器中，用它来获取 KEEP_KEY 元数据，以决定是否对响应数据进行包装。
 * */
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AjaxResult } from '../class/ajax-result.class';
import { KEEP_KEY } from '../contants/decorator.contant';

@Injectable()
export class ReponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // getHandler 值将覆盖 getClass上面的值
        const keep = this.reflector.getAllAndOverride<boolean>(KEEP_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (keep) return data;
        const response = context.switchToHttp().getResponse();
        response.header('Content-Type', 'application/json; charset=utf-8');
        return AjaxResult.success(data);
      }),
    );
  }
}
