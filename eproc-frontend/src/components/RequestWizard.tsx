import { useState, useEffect } from 'react';
import type { CreateMaterialRequest, Materialrequest, Material, Site } from '../types/models';
import { requestService } from '../services/requestService';

interface RequestWizardProps {
  sites: Site[];
  materials: Material[];
  requestToEdit?: MaterialRequest | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WizardStep = 'emergency' | 'site' | 'material' | 'details' | 'review';

export default function RequestWizard({ sites, materials, requestToEdit, onSuccess, onCancel }: RequestWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('emergency');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [emergencyFlag, setEmergencyFlag] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [materialMode, setMaterialMode] = useState<'catalog' | 'manual'>('catalog');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [manualMaterialName, setManualMaterialName] = useState('');
  const [manualUnit, setManualUnit] = useState('');
  const [manualEstimatedPrice, setManualEstimatedPrice] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const [plannedUsageStart, setPlannedUsageStart] = useState('');
  const [plannedUsageEnd, setPlannedUsageEnd] = useState('');

  // Initialize state if editing
  useEffect(() => {
    if (requestToEdit) {
      setEmergencyFlag(requestToEdit.emergencyFlag);
      setSelectedSiteId(requestToEdit.siteId);
      setQuantity(requestToEdit.quantity);
      setPlannedUsageStart(new Date(requestToEdit.plannedUsageStart).toISOString().slice(0, 16));
      setPlannedUsageEnd(new Date(requestToEdit.plannedUsageEnd).toISOString().slice(0, 16));

      if (requestToEdit.materialId) {
        setMaterialMode('catalog');
        setSelectedMaterialId(requestToEdit.materialId);
      } else {
        setMaterialMode('manual');
        setManualMaterialName(requestToEdit.manualMaterialName || '');
        setManualUnit(requestToEdit.manualUnit || '');
        setManualEstimatedPrice(requestToEdit.manualEstimatedPrice);
      }
    }
  }, [requestToEdit]);

  const steps: WizardStep[] = ['emergency', 'site', 'material', 'details', 'review'];
  const stepLabels: Record<WizardStep, string> = {
    emergency: 'Urgency',
    site: 'Select Site',
    material: 'Select Material',
    details: 'Quantity & Schedule',
    review: 'Review & Submit',
  };

  const currentStepIndex = steps.indexOf(currentStep);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'emergency':
        return true;
      case 'site':
        return selectedSiteId !== null;
      case 'material':
        if (materialMode === 'catalog') {
          return selectedMaterialId !== null;
        }
        return manualMaterialName.trim() !== '' && manualUnit.trim() !== '';
      case 'details':
        return quantity > 0 && plannedUsageStart !== '' && plannedUsageEnd !== '';
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedSiteId) return;

    setIsSubmitting(true);
    setError(null);

    const data: CreateMaterialRequest = {
      siteId: selectedSiteId,
      quantity,
      plannedUsageStart: new Date(plannedUsageStart).toISOString(),
      plannedUsageEnd: new Date(plannedUsageEnd).toISOString(),
      emergencyFlag,
    };

    if (materialMode === 'catalog' && selectedMaterialId) {
      data.materialId = selectedMaterialId;
    } else {
      data.manualMaterialName = manualMaterialName;
      data.manualUnit = manualUnit;
      if (manualEstimatedPrice) {
        data.manualEstimatedPrice = manualEstimatedPrice;
      }
    }

    try {
      if (requestToEdit) {
        await requestService.updateRequest(requestToEdit.id, data);
      } else {
        await requestService.createRequest(data);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save request';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  return (
    <div className="request-wizard">
      {/* Progress indicator */}
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`progress-step ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{stepLabels[step]}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="wizard-content">
        {currentStep === 'emergency' && (
          <div className="step-emergency">
            <h3>Is this an emergency request?</h3>
            <label className={`emergency-toggle ${emergencyFlag ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={emergencyFlag}
                onChange={(e) => setEmergencyFlag(e.target.checked)}
              />
              <span className="toggle-label">
                {emergencyFlag ? '⚠️ EMERGENCY' : 'Standard Request'}
              </span>
            </label>
            {emergencyFlag && (
              <p className="emergency-warning">
                Emergency requests are flagged for priority review.
              </p>
            )}
          </div>
        )}

        {currentStep === 'site' && (
          <div className="step-site">
            <h3>Select a Site</h3>
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) => setSelectedSiteId(e.target.value ? Number(e.target.value) : null)}
              className="site-select"
            >
              <option value="">Choose a site...</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.location ? `(${site.location})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentStep === 'material' && (
          <div className="step-material">
            <h3>Select Material</h3>
            <div className="material-mode-toggle">
              <button
                type="button"
                className={materialMode === 'catalog' ? 'active' : ''}
                onClick={() => setMaterialMode('catalog')}
              >
                From Catalog
              </button>
              <button
                type="button"
                className={materialMode === 'manual' ? 'active' : ''}
                onClick={() => setMaterialMode('manual')}
              >
                Manual Entry
              </button>
            </div>

            {materialMode === 'catalog' ? (
              <select
                value={selectedMaterialId ?? ''}
                onChange={(e) => setSelectedMaterialId(e.target.value ? Number(e.target.value) : null)}
                className="material-select"
              >
                <option value="">Choose a material...</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({mat.category})
                  </option>
                ))}
              </select>
            ) : (
              <div className="manual-material-form">
                <input
                  type="text"
                  placeholder="Material name"
                  value={manualMaterialName}
                  onChange={(e) => setManualMaterialName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Unit (e.g., KG, PCS)"
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Estimated price (optional)"
                  value={manualEstimatedPrice ?? ''}
                  onChange={(e) => setManualEstimatedPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 'details' && (
          <div className="step-details">
            <h3>Quantity & Schedule</h3>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Usage Start Date</label>
              <input
                type="datetime-local"
                value={plannedUsageStart}
                onChange={(e) => setPlannedUsageStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Usage End Date</label>
              <input
                type="datetime-local"
                value={plannedUsageEnd}
                onChange={(e) => setPlannedUsageEnd(e.target.value)}
                min={plannedUsageStart}
              />
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="step-review">
            <h3>Review Your Request</h3>
            {emergencyFlag && <p className="emergency-badge">⚠️ EMERGENCY REQUEST</p>}
            <dl className="review-list">
              <dt>Site</dt>
              <dd>{selectedSite?.name || 'Not selected'}</dd>
              <dt>Material</dt>
              <dd>
                {materialMode === 'catalog'
                  ? selectedMaterial?.name || 'Not selected'
                  : `${manualMaterialName} (${manualUnit})`}
              </dd>
              <dt>Quantity</dt>
              <dd>{quantity}</dd>
              <dt>Usage Period</dt>
              <dd>
                {plannedUsageStart && plannedUsageEnd
                  ? `${new Date(plannedUsageStart).toLocaleDateString()} - ${new Date(plannedUsageEnd).toLocaleDateString()}`
                  : 'Not set'}
              </dd>
            </dl>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="wizard-actions">
        {currentStepIndex > 0 && (
          <button type="button" onClick={goBack} disabled={isSubmitting}>
            Back
          </button>
        )}
        {onCancel && currentStepIndex === 0 && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
        {currentStep !== 'review' ? (
          <button type="button" onClick={goNext} disabled={!canProceed()}>
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="submit-btn"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        )}
      </div>

      <style>{`
        .request-wizard {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }
        .wizard-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.5;
        }
        .progress-step.active {
          opacity: 1;
        }
        .progress-step.completed .step-number {
          background: #10b981;
        }
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #6366f1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .step-label {
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        .wizard-content {
          min-height: 200px;
          margin-bottom: 2rem;
        }
        .emergency-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
        }
        .emergency-toggle.active {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .emergency-warning {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 1rem;
        }
        .site-select, .material-select {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        .material-mode-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .material-mode-toggle button {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
        }
        .material-mode-toggle button.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }
        .manual-material-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .manual-material-form input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        .review-list {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 0.5rem;
        }
        .review-list dt {
          font-weight: 500;
          color: #6b7280;
        }
        .emergency-badge {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 1rem;
        }
        .wizard-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }
        .wizard-actions button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .wizard-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .submit-btn {
          background: #10b981;
          color: white;
        }
        .cancel-btn {
          background: #f3f4f6;
        }
        .error-message {
          color: #dc2626;
          background: #fef2f2;
          padding: 0.75rem;
          border-radius: 6px;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
