import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { DuplicateWarningModal } from '@/components/DuplicateWarningModal';
import { formatCurrency } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/common/FormField';
import { MaterialItemsTable } from '@/components/domain/requests/create/MaterialItemsTable';
import { useCreateRequest } from '@/hooks/useCreateRequest';

const CreateRequest = () => {
  const {
    state: {
      sites,
      loadingSites,
      error,
      validationErrors,
      boqEntries,
      duplicateWarnings,
      showDuplicateModal,
      duplicateExplanation,
      isSubmitting,
    },
    actions: {
      addBOQEntry,
      removeBOQEntry,
      updateBOQEntry,
      addMaterial,
      removeMaterial,
      updateMaterial,
      addLabour,
      removeLabour,
      updateLabour,
      calculateMaterialCost,
      calculateLabourCost,
      calculateBOQTotal,
      calculateGrandTotal,
      handleSubmit,
      handleDuplicateConfirm,
      handleDuplicateCancel,
      setDuplicateExplanation,
      navigate,
    },
  } = useCreateRequest();

  if (loadingSites) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading form..." />
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      <PageHeader
        title="Create BOQ Request"
        description="Submit a Bill of Quantities for your assigned project"
      />

      {error && (
        <ErrorDisplay error={new Error(error)} message={error} variant="inline" />
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {boqEntries.map((entry, entryIndex) => (
          <Card
            key={entry.tempId}
            className="flex flex-col shadow-none border border-slate-200/50"
          >
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
              <CardTitle className="text-base font-bold text-[#2a3455]">
                BOQ Entry {entryIndex + 1}
              </CardTitle>
              {boqEntries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBOQEntry(entry.tempId)}
                  className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove BOQ
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-3 sm:p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-4 border-b border-slate-100">
                {/* Site */}
                <FormField
                  label="Site"
                  htmlFor={`site-${entry.tempId}`}
                  error={validationErrors[`site-${entry.tempId}`]}
                >
                  <Select
                    value={entry.siteId}
                    onValueChange={val => updateBOQEntry(entry.tempId, 'siteId', val)}
                    disabled={sites.length === 0}
                  >
                    <SelectTrigger
                      id={`site-${entry.tempId}`}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    >
                      <SelectValue
                        placeholder={
                          sites.length === 0 ? 'No sites available' : 'Select a site...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.length === 0 ? (
                        <SelectItem value="no-sites" disabled className="text-xs sm:text-sm">
                          No sites available
                        </SelectItem>
                      ) : (
                        sites.map(site => (
                          <SelectItem
                            key={site.id}
                            value={site.id.toString()}
                            className="text-xs sm:text-sm"
                          >
                            {site.name} – {site.location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Priority / Emergency */}
                <FormField label="Priority" htmlFor={`emergency-${entry.tempId}`}>
                  <div className="flex items-center gap-2 h-9 sm:h-10">
                    <input
                      type="checkbox"
                      id={`emergency-${entry.tempId}`}
                      checked={entry.emergencyFlag}
                      onChange={e =>
                        updateBOQEntry(entry.tempId, 'emergencyFlag', e.target.checked)
                      }
                      className="h-4 w-4 accent-orange-500"
                    />
                    <label
                      htmlFor={`emergency-${entry.tempId}`}
                      className="text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Mark as Emergency
                    </label>
                  </div>
                </FormField>

                {/* BOQ Task Description */}
                <FormField
                  label="BOQ Task Description"
                  required
                  htmlFor={`boq-desc-${entry.tempId}`}
                  className="sm:col-span-2"
                  error={validationErrors[`boqDesc-${entry.tempId}`]}
                >
                  <Input
                    id={`boq-desc-${entry.tempId}`}
                    value={entry.boqDescription}
                    onChange={e =>
                      updateBOQEntry(entry.tempId, 'boqDescription', e.target.value)
                    }
                    placeholder="e.g., Supply, cut, bend and fix reinforcement steel bars for pad foundations"
                    className="h-9 sm:h-10 text-sm"
                  />
                </FormField>

                {/* Additional Details */}
                <FormField
                  label="Additional Details (Optional)"
                  htmlFor={`work-desc-${entry.tempId}`}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id={`work-desc-${entry.tempId}`}
                    value={entry.workDescription}
                    onChange={e =>
                      updateBOQEntry(entry.tempId, 'workDescription', e.target.value)
                    }
                    rows={2}
                    placeholder="Additional work details..."
                    className="resize-none text-sm"
                  />
                </FormField>

                {/* Planned Start */}
                <FormField
                  label="Planned Start"
                  htmlFor={`start-${entry.tempId}`}
                >
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      id={`start-${entry.tempId}`}
                      type="date"
                      value={entry.plannedStart}
                      onChange={e =>
                        updateBOQEntry(entry.tempId, 'plannedStart', e.target.value)
                      }
                      className="h-9 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </FormField>

                {/* Planned End */}
                <FormField
                  label="Planned End"
                  htmlFor={`end-${entry.tempId}`}
                >
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      id={`end-${entry.tempId}`}
                      type="date"
                      value={entry.plannedEnd}
                      onChange={e =>
                        updateBOQEntry(entry.tempId, 'plannedEnd', e.target.value)
                      }
                      className="h-9 sm:h-10 text-xs sm:text-sm pl-8"
                    />
                  </div>
                </FormField>
              </div>

              {/* ── Materials Table ───────────────────────────────────────── */}
              <MaterialItemsTable
                boqTempId={entry.tempId}
                mode="material"
                items={entry.materials}
                subtotal={calculateMaterialCost(entry)}
                onAdd={() => addMaterial(entry.tempId)}
                onRemove={id => removeMaterial(entry.tempId, id)}
                onUpdate={(id, field, val) => updateMaterial(entry.tempId, id, field as any, val)}
                errors={validationErrors}
                sectionError={validationErrors[`items-${entry.tempId}`]}
              />

              {/* ── Labour Table ──────────────────────────────────────────── */}
              <MaterialItemsTable
                boqTempId={entry.tempId}
                mode="labour"
                items={entry.labour}
                subtotal={calculateLabourCost(entry)}
                onAdd={() => addLabour(entry.tempId)}
                onRemove={id => removeLabour(entry.tempId, id)}
                onUpdate={(id, field, val) => updateLabour(entry.tempId, id, field as any, val)}
                errors={validationErrors}
              />

              {/* ── BOQ Total ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 bg-slate-50 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2.5 rounded-b">
                <span className="text-sm font-semibold text-slate-700">
                  BOQ {entryIndex + 1} Total
                </span>
                <span className="text-base font-bold text-indigo-900">
                  {formatCurrency(calculateBOQTotal(entry))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* ── Add Another BOQ ──────────────────────────────────────────────── */}
        <Button
          type="button"
          variant="outline"
          onClick={addBOQEntry}
          className="w-full h-10 text-sm border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another BOQ Entry
        </Button>

        {/* ── Grand Total Summary Card ─────────────────────────────────────── */}
        <Card className="flex flex-col shadow-none border border-slate-200/50">
          <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <CardTitle className="text-base font-bold text-[#2a3455]">Total Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between bg-indigo-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 rounded-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Grand Total ({boqEntries.length} BOQ
                  {boqEntries.length > 1 ? 's' : ''})
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-indigo-900">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Form Actions ─────────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/engineer/requests')}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#2a3455] hover:bg-[#1e253b] text-white min-w-[120px] sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit All BOQs'}
          </Button>
        </div>
      </form>

      {/* ── Duplicate Warning Modal ──────────────────────────────────────────── */}
      {showDuplicateModal && (
        <DuplicateWarningModal
          warnings={duplicateWarnings}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
          explanation={duplicateExplanation}
          onExplanationChange={setDuplicateExplanation}
        />
      )}
    </div>
  );
};

export default CreateRequest;
