import React, { type ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

interface GenericModalProps {
    /** 
     * Controls whether the modal is visible.
     */
    isOpen: boolean;

    /** 
     * Callback triggered when the modal requests to close. 
     */
    onClose: (open: boolean) => void;

    /** 
     * The main title displayed in the modal header.
     * Can be a string or complex React node.
     */
    title: ReactNode;

    /** 
     * Optional description displayed below the title.
     */
    description?: ReactNode;

    /** 
     * The main interactive content of the modal.
     */
    children: ReactNode;

    /** 
     * Optional footer contents (e.g. Buttons). 
     * Rendered inside DialogFooter.
     */
    footer?: ReactNode;

    /** 
     * Override for the root content max width (e.g. 'sm:max-w-md', 'max-w-2xl').
     * Defaults to general standard width if omitted.
     */
    maxWidthClass?: string;

    /**
     * Optional handler for interacting outside the modal (e.g., to prevent closing)
     */
    onInteractOutside?: (e: Event) => void;
}

/**
 * A standardized reusable wrapper that bundles Shadcn UI Dialog boilerplate.
 * Enforces standardized max-heights and scrollable overflow behavior.
 */
export const GenericModal: React.FC<GenericModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidthClass = 'sm:max-w-md',
    onInteractOutside
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={`${maxWidthClass} max-h-[90vh] overflow-y-auto`}
                onInteractOutside={onInteractOutside}
            >
                <DialogHeader className='space-y-0.5'>
                    <DialogTitle className="flex items-center text-[#2a3455] font-bold">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-[#2a3455]">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div>
                    {children}
                </div>

                {footer && (
                    <DialogFooter className='flex-row gap-3 justify-end'>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
