import { EnvironmentalSection } from '../components/Sections/EnvironmentalSection';
import { PageNavigation } from '../components/PageNavigation';

export function EnvironmentPage({ forcingData }) {
  return (
    <div className="page-content">
      <section className="page-header">
        <div>
          <span className="page-eyebrow">
            PHASE 02 / ENVIRONMENT
          </span>

          <h1>Environmental Conditions</h1>

          <p>
            Atmospheric and oceanographic conditions influencing
            the observed marine spill.
          </p>
        </div>
      </section>

      <section className="page-section">
        <EnvironmentalSection
          forcingData={forcingData}
        />
      </section>

      <PageNavigation currentPage="/environment" />
    </div>
  );
}