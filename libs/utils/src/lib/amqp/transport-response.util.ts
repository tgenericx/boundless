import { TransportResponse } from '../../types';

export function isTransportResponse<T>(
  value: unknown,
): value is TransportResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}
