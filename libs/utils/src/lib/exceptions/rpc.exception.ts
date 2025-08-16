import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { RpcExceptionPayload, TransportResponse } from '../../types';
import { formatRpcError } from '../amqp';

export function throwRpcException(data: RpcExceptionPayload): never {
  throw new RpcException(data);
}

@Catch(RpcException)
export class TransportExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  private readonly logger = new Logger(TransportExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<unknown> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    this.logger.error(exception);

    const formattedError = formatRpcError(exception, data);

    return throwError(
      () => new RpcException(formattedError satisfies TransportResponse<never>),
    );
  }
}
