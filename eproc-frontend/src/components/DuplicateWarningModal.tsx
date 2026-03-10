import React from 'react';
import { GenericModal } from '@/components/common/GenericModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface DuplicateWarning {
    requestId: number;
    requestTitle: string;
    boqReferenceCode: string;
    plannedStartDate: string;
    plannedEndDate: string;
    overlappingMaterials: string[];
    timelineOverlapPercentage: number;
    status: string;
    siteName: string;
}

interface DuplicateWarningModalProps {
    warnings: DuplicateWarning[];
    onConfirm: (explanation: string) => void;
    onCancel: () => void;
    explanation: string;
    onExplanationChange: (val: string) => void;
}

/**
 * Modal that displays duplicate request warnings and requires explanation.
 */
export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
    warnings,
    onConfirm,
    onCancel,
    explanation,
    onExplanationChange,
}) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PARTIALLY_APPROVED':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const modalTitle = (
        <React.Fragment>
            <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xl">Duplicate Request Detected</span>
        </React.Fragment>
    );

    const modalFooter = (
        <React.Fragment>
            <Button variant="outline" onClick={onCancel} className="text-sm">
                Cancel & Review
            </Button>
            <Button
                onClick={() => onConfirm(explanation)}
                disabled={!explanation || explanation.trim().length === 0}
                className="text-sm bg-orange-500 hover:bg-orange-600"
            >
                Confirm & Submit
            </Button>
        </React.Fragment>
    );

    return (
        <GenericModal
            isOpen={true}
            onClose={(open) => !open && onCancel()}
            title={modalTitle}
            footer={modalFooter}
            maxWidthClass="max-w-2xl"
        >

            <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                        This request contains items (materials/labourers) that overlap with existing requests for the same site and timeline.
                        Please review the existing requests below and provide an explanation for why this duplicate is necessary.
                    </p>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                        Existing Requests ({warnings.length})
                    </h4>

                    {warnings.map((warning) => (
                        <Card key={warning.requestId} className="border-orange-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-medium">
                                            {warning.requestTitle}
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">
                                            BOQ: {warning.boqReferenceCode} • Site: {warning.siteName}
                                        </p>
                                    </div>
                                    <Badge className={`text-xs ${getStatusColor(warning.status)}`}>
                                        {warning.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="font-medium text-slate-600">Timeline:</span>
                                        <p className="text-slate-800">
                                            {formatDate(warning.plannedStartDate)} - {formatDate(warning.plannedEndDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-600">Overlap:</span>
                                        <p className="text-slate-800">
                                            <span className="font-semibold text-orange-600">
                                                {warning.timelineOverlapPercentage.toFixed(0)}%
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-600">Overlapping Items (Materials/Labourers):</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {warning.overlappingMaterials.map((material, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {material}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duplicate-explanation" className="text-sm font-medium">
                        Explanation for Duplicate Request <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="duplicate-explanation"
                        placeholder="e.g., Additional materials needed due to scope change, emergency replacement, revised BOQ quantities, etc."
                        value={explanation}
                        onChange={(e) => onExplanationChange(e.target.value)}
                        rows={4}
                        className="text-sm"
                    />
                    <p className="text-xs text-slate-500">
                        This explanation will be visible to the project owner when reviewing your request.
                    </p>
                </div>
            </div>
        </GenericModal>
    );
};
