import React, { type ReactNode } from 'react';
import { GenericModal } from './GenericModal';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
    /** Controls whether the modal is visible */
    isOpen: boolean;
    /** Callback triggered when the modal requests to close, or when Cancel is clicked */
    onClose: () => void;
    /** Callback triggered when the Confirm button is clicked */
    onConfirm: () => void;
    /** The main title displayed in the modal header */
    title: ReactNode;
    /** The descriptive text asking for confirmation */
    description: ReactNode;
    /** Label for the confirm button. Defaults to 'Confirm' */
    confirmLabel?: string;
    /** Label for the cancel button. Defaults to 'Cancel' */
    cancelLabel?: string;
    /** Variant of the confirm button to convey severity (e.g. 'destructive', 'default') */
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    /** Is the confirm action currently loading? */
    isPending?: boolean;
}

/**
 * A standardized confirmation modal built on top of GenericModal.
 * Used for confirming destructive or significant actions.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmVariant = 'default',
    isPending = false,
}) => {
    return (
        <GenericModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            maxWidthClass="sm:max-w-md"
            onInteractOutside={(e) => {
                // Prevent closing if the action is currently resolving
                if (isPending) e.preventDefault();
            }}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                        className="text-slate-600"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={isPending}
                        className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                    >
                        {isPending ? 'Processing...' : confirmLabel}
                    </Button>
                </>
            }
        >
            <></>
            {/* The wrapper handles title and description; we don't need body content for standard confirms. */}
        </GenericModal>
    );
};
