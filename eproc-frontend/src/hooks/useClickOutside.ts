import { useEffect, type RefObject } from 'react';

/**
 * useClickOutside – Dismiss UI elements when clicking outside their container.
 *
 * @param ref     - React ref attached to the container element
 * @param handler - Callback invoked on an outside click
 * @param enabled - Guard flag; the listener is only active when `true`
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false), isOpen);
 * ```
 */
export function useClickOutside(
    ref: RefObject<HTMLElement | null>,
    handler: () => void,
    enabled: boolean = true,
) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler, enabled]);
}
