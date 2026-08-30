import { DataProvenanceSection } from '../components/Sections/DataProvenanceSection';
import { PageNavigation } from '../components/PageNavigation';

export function ProvenancePage() {
  return (
    <div className="page-content">
      <section className="page-header">
        <div>
          <span className="page-eyebrow">
            PHASE 05 / PROVENANCE
          </span>

          <h1>Data & Technical Provenance</h1>

          <p>
            Data sources, processing pipeline, methodology and
            technical architecture.
          </p>
        </div>
      </section>

      <section className="page-section">
        <DataProvenanceSection />
      </section>

      <PageNavigation currentPage="/provenance" />
    </div>
  );
}