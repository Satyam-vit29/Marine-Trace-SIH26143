import { DriftOriginSection } from '../components/Sections/DriftOriginSection';
import { PageNavigation } from '../components/PageNavigation';

export function DriftPage({
  forwardData,
  originData,
}) {
  return (
    <div className="page-content">
      <section className="page-header">
        <div>
          <span className="page-eyebrow">
            PHASE 03 / DRIFT ANALYSIS
          </span>

          <h1>Drift Simulation & Probable Origin</h1>

          <p>
            Model spill movement and estimate the most probable
            source region.
          </p>
        </div>
      </section>

      <section className="page-section">
        <DriftOriginSection
          forwardData={forwardData}
          originData={originData}
        />
      </section>

      <PageNavigation currentPage="/drift" />
    </div>
  );
}