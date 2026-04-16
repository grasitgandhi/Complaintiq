// frontend/src/hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 *
 * @param {Function} apiFn - the api function to call (e.g. api.complaints.list)
 * @param {any} params - arguments to pass to apiFn
 * @param {Array} deps - dependency array that triggers a refetch when changed
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(api.complaints.list, { agent_id: 'me' }, [token]);
 */
export default function useApi(apiFn, params, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const callId = useRef(0);

  const execute = useCallback(async () => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(params);
      // Ignore stale responses if a newer call has been made
      if (id === callId.current) setData(result);
    } catch (err) {
      if (id === callId.current) setError(err.message || 'An error occurred');
    } finally {
      if (id === callId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
