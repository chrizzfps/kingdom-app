import { useState, useEffect, useCallback } from 'react';
import { getGlobalPaymentMethods, saveGlobalPaymentMethods, type GlobalPaymentMethod } from '@/api/settings';

export function useGlobalPaymentMethods() {
    const [methods, setMethods] = useState<GlobalPaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getGlobalPaymentMethods()
            .then(setMethods)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const save = useCallback(async (newMethods: GlobalPaymentMethod[]) => {
        setSaving(true);
        try {
            await saveGlobalPaymentMethods(newMethods);
            setMethods(newMethods);
        } finally {
            setSaving(false);
        }
    }, []);

    return { methods, loading, saving, save, setMethods };
}
