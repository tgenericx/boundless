import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransportResponse } from '../../types';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { isTransportResponse } from './transport-response.util';

@Injectable()
export class TransportResponseInterceptor<T>
  implements NestInterceptor<T, TransportResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransportResponse<T>> {
    if (!isRabbitContext(context)) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        if (isTransportResponse(data)) {
          return data;
        }

        return {
          success: true,
          data,
        } satisfies TransportResponse<typeof data>;
      }),
    );
  }
}
