import { useCallback, useState } from 'react';
import type { Proposal } from '@/types/proposal';
import {
  createProposal as apiCreate,
  deleteProposal as apiDelete,
  getProposals as apiList,
  getProposal as apiGet,
  updateProposal as apiUpdate,
  getPublicProposal as apiGetPublic,
} from '@/api/proposals';

export function useProposal() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [current, setCurrent] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiList();
      setItems(data);
      return data;
    } catch (e: any) {
      setError(e?.message || 'Error listando propuestas');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet(id);
      setCurrent(data);
      return data;
    } catch (e: any) {
      setError(e?.message || 'Error obteniendo propuesta');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBySlugPublic = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetPublic(slug);
      setCurrent(data);
      return data;
    } catch (e: any) {
      setError(e?.message || 'Error obteniendo propuesta pública');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<Proposal>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCreate(payload);
      setCurrent(data);
      return data;
    } catch (e: any) {
      setError(e?.message || 'Error creando propuesta');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, changes: Partial<Proposal>) => {
    setLoading(true);
    setError(null);
    try {
      await apiUpdate(id, changes);
      const refreshed = await apiGet(id);
      setCurrent(refreshed);
      return refreshed;
    } catch (e: any) {
      setError(e?.message || 'Error actualizando propuesta');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const publish = useCallback(async (id: string) => {
    return update(id, { status: 'published' } as any);
  }, [update]);

  const accept = useCallback(async (id: string) => {
    return update(id, { status: 'accepted' } as any);
  }, [update]);

  const reject = useCallback(async (id: string) => {
    return update(id, { status: 'rejected' } as any);
  }, [update]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiDelete(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Error eliminando propuesta');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    current,
    loading,
    error,
    list,
    getById,
    getBySlugPublic,
    create,
    update,
    publish,
    accept,
    reject,
    remove,
  };
}
