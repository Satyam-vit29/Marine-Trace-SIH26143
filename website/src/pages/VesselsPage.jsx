import { AisCorrelationSection } from '../components/Sections/AisCorrelationSection';
import { PageNavigation } from '../components/PageNavigation';

export function VesselsPage({
  aisData,
  selectedVesselName,
  onSelectVessel,
  onOpenDossier,
}) {
  return (
    <div className="page-content">
      <section className="page-header">
        <div>
          <span className="page-eyebrow">
            PHASE 04 / AIS CORRELATION
          </span>

          <h1>Vessel Attribution</h1>

          <p>
            Correlate vessel movement with the estimated spill
            origin and trajectory.
          </p>
        </div>
      </section>

      <section className="page-section">
        <AisCorrelationSection
  vessels={aisData?.vessels || []}
  selectedVesselName={selectedVesselName}
  onSelectVessel={onSelectVessel}
  onOpenDossier={onOpenDossier}
/>
      </section>

      <PageNavigation currentPage="/vessels" />
    </div>
  );
}