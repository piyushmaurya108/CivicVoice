import { useCallback, useEffect, useState } from 'react';
import { describeError, fetchComplaints } from '../api/index.js';

/**
 * Hook to fetch and paginate complaints.
 * Pass filters as the `params` arg; reload by calling `refresh()`.
 */
export default function useComplaints(params = {}) {
  const [data, setData] = useState({
    complaints: [],
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify params to use as effect dep — avoids new object identity on every render
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchComplaints(JSON.parse(paramsKey));
      setData({
        complaints: res.complaints || [],
        total: res.total || 0,
        page: res.page || 1,
        totalPages: res.totalPages || 1
      });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    complaints: data.complaints,
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    loading,
    error,
    refresh: load
  };
}
