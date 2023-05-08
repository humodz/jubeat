import { useEffect, useState } from 'react';

type Status = 'loading' | 'success' | 'error';

export type LoaderResult<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: any };

/** @deprecated */
export function useLoader<T>(factory: () => Promise<T>) {
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();

  useEffect(() => {
    async function run() {
      try {
        const result = await factory();
        setStatus('success');
        setData(result);
      } catch (error) {
        console.error(error);
        setStatus('error');
        setError(error);
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, data, error } as LoaderResult<T>;
}
