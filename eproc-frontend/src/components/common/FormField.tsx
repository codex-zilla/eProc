/**
 * FormField Component
 * 
 * Reusable wrapper for form field label + input + error message.
 * Eliminates the repeated <div><Label>...<Input/><error/></div> pattern
 * used across wizard steps and form modals.
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    /** The label text displayed above the input */
    label: string;
    /** Whether the field is required (shows red asterisk) */
    required?: boolean;
    /** Validation error message to display below the input */
    error?: string;
    /** Hint text displayed below the label */
    hint?: string;
    /** Optional htmlFor attribute for the label */
    htmlFor?: string;
    /** Additional className for the wrapper */
    className?: string;
    /** The form control (Input, Select, Textarea, Checkbox, etc.) */
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    required = false,
    error,
    hint,
    htmlFor,
    className,
    children
}) => {
    return (
        <div className={cn('grid gap-1.5 sm:gap-2', className)}>
            <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {children}
            {hint && (
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden">{hint}</p> // TOBE changed
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};
