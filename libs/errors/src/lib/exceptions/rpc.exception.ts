import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { ErrorPayload } from '../interfaces/error-payload.interface';

export function throwRpcException(data: ErrorPayload): never {
  throw new RpcException(data);
}

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<unknown> {
    return throwError(() => exception.getError());
  }
}
