import { Card } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { WizardStepper } from '@/components/common/WizardStepper';
import { WizardFooter } from '@/components/common/WizardFooter';
import { WizardStepIdentity } from '@/components/domain/projects/wizard/WizardStepIdentity';
import { WizardStepLocation } from '@/components/domain/projects/wizard/WizardStepLocation';
import { WizardStepTimeline } from '@/components/domain/projects/wizard/WizardStepTimeline';
import { WizardStepContext } from '@/components/domain/projects/wizard/WizardStepContext';
import { WizardStepReview } from '@/components/domain/projects/wizard/WizardStepReview';
import { useProjectWizard } from '@/hooks/useProjectWizard';
import type { Project } from '@/types/models';

interface ProjectWizardProps {
    initialData?: Project;
    isEditMode?: boolean;
}

const TOTAL_STEPS = 5;

const ProjectWizard = ({ initialData, isEditMode = false }: ProjectWizardProps) => {
    const wizard = useProjectWizard({ initialData, isEditMode });

    // Shared props for steps 1-4
    const stepProps = {
        formData: wizard.formData,
        handleChange: wizard.handleChange,
        fieldErrors: wizard.fieldErrors
    };

    return (
        <div className="max-w-7xl mx-auto">
            <WizardStepper currentStep={wizard.step} totalSteps={TOTAL_STEPS} />

            {wizard.error && (
                <ErrorDisplay
                    variant="inline"
                    error={null}
                    title="Error"
                    message={wizard.error}
                    className="mb-4 sm:mb-6"
                />
            )}

            <Card className="shadow-none border-none bg-white/70">
                {wizard.step === 1 && (
                    <WizardStepIdentity
                        {...stepProps}
                        exchangeRate={wizard.exchangeRate}
                    />
                )}

                {wizard.step === 2 && (
                    <WizardStepLocation
                        {...stepProps}
                        mapCenter={wizard.mapCenter}
                        markerPosition={wizard.markerPosition}
                        handleLocationSelect={wizard.handleLocationSelect}
                        regions={wizard.regions}
                        districts={wizard.districts}
                        wards={wizard.wards}
                        addSite={wizard.addSite}
                        removeSite={wizard.removeSite}
                        updateSite={wizard.updateSite}
                    />
                )}

                {wizard.step === 3 && (
                    <WizardStepTimeline {...stepProps} />
                )}

                {wizard.step === 4 && (
                    <WizardStepContext {...stepProps} />
                )}

                {wizard.step === 5 && (
                    <WizardStepReview formData={wizard.formData} />
                )}

                <WizardFooter
                    step={wizard.step}
                    totalSteps={TOTAL_STEPS}
                    loading={wizard.loading}
                    isEditMode={isEditMode}
                    onBack={wizard.prevStep}
                    onNext={wizard.nextStep}
                    onSubmit={wizard.handleSubmit}
                />
            </Card>
        </div>
    );
};

export default ProjectWizard;
