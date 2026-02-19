import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { loadDraft, saveDraft, clearDraft } from '@/lib/utils';


interface UseDraftOptions<T> {
    key: string;
    initialData?: T | null;
    shouldLoad?: boolean;
    onLoad?: (draft: T) => void;
}

/**
 * Generic hook to manage form drafts in localStorage.
 * Handles loading, saving (debounced), and clearing drafts.
 */
export function useDraft<T>(
    { key, initialData, shouldLoad = true, onLoad }: UseDraftOptions<T>
) {
    const [draftData, setDraftData] = useState<T | null>(initialData || null);
    const loadedKeyRef = useRef<string | null>(null);

    // Load Draft
    useEffect(() => {
        if (!shouldLoad) return;
        if (loadedKeyRef.current === key) return;

        const draft = loadDraft<T>(key);
        if (draft) {
            setDraftData(draft);
            if (onLoad) onLoad(draft);
            toast.info('Draft loaded successfully');
        }
        loadedKeyRef.current = key;
    }, [key, shouldLoad, onLoad]);

    // Save Draft Logic
    // Note: The hook user is responsible for passing the *current* state they want to save.
    // We provide a save function, but for auto-save, we might need the data passed in.
    // However, usually hooks manage state or receive it.
    // Let's adapt to the pattern in PurchaseOrderForm:
    // It uses useDebounce on individual fields.
    // To make this generic, we can accept the data to save.
    
    const saveData = (data: T) => {
        saveDraft(key, data);
    };

    const clearData = () => {
        clearDraft(key);
        setDraftData(null);
    };

    return {
        draftData,
        saveData,
        clearData
    };
}
