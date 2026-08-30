import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pages = [
  {
    path: '/',
    label: 'Investigation',
  },
  {
    path: '/environment',
    label: 'Environment',
  },
  {
    path: '/drift',
    label: 'Drift & Origin',
  },
  {
    path: '/vessels',
    label: 'Vessel Attribution',
  },
  {
    path: '/provenance',
    label: 'Data & Provenance',
  },
];

export function PageNavigation({ currentPage }) {
  const navigate = useNavigate();

  const currentIndex = pages.findIndex(
    (page) => page.path === currentPage
  );

  const previousPage =
    currentIndex > 0
      ? pages[currentIndex - 1]
      : null;

  const nextPage =
    currentIndex < pages.length - 1
      ? pages[currentIndex + 1]
      : null;

  return (
    <nav className="page-navigation" aria-label="Page navigation">

      {/* Previous */}
      <button
        type="button"
        className="page-nav-button page-nav-prev"
        disabled={!previousPage}
        onClick={() => {
          if (previousPage) {
            navigate(previousPage.path);
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }
        }}
      >
        <ChevronLeft size={18} />

        <span>
          {previousPage ? 'Previous' : 'Start'}
        </span>
      </button>

      {/* Center */}
      <div className="page-progress">

        <div className="page-progress-top">
          <span className="page-progress-current">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>

          <span className="page-progress-slash">
            /
          </span>

          <span className="page-progress-total">
            {String(pages.length).padStart(2, '0')}
          </span>
        </div>

        <div className="page-progress-label">
          {pages[currentIndex]?.label}
        </div>

      </div>

      {/* Next */}
      <button
        type="button"
        className="page-nav-button page-nav-next"
        disabled={!nextPage}
        onClick={() => {
          if (nextPage) {
            navigate(nextPage.path);
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }
        }}
      >
        <span>
          {nextPage ? 'Next' : 'Finish'}
        </span>

        <ChevronRight size={18} />
      </button>

    </nav>
  );
}