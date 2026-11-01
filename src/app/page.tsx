'use client';

import Link from 'next/link';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ui from '@/components/ui.module.css';

export default function LandingPage() {
  const loadSample = usePlanStore(s => s.loadSampleEvent);
  const router = useRouter();

  const handleSample = () => {
    loadSample();
    router.push('/plan/overview');
  };

  return (
    <main id="main-content" className={styles.landing}>
      <div className={`${ui.card} ${styles.hero}`}>
        <div className={styles.brand}>
          <h1 className={styles.appName}>{copy.appName}</h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>

        <p className={styles.tagline}>
          {copy.landing.heroSubtitle}
        </p>

        <div className={styles.ctas}>
          <Link href="/start" className={ui.btnPrimary}>
            {copy.landing.ctaStart}
          </Link>
          <button onClick={handleSample} className={ui.btnSecondary}>
            {copy.landing.ctaSample}
          </button>
        </div>

        <div className={styles.proofPoints}>
          {copy.landing.proofPoints.map((point, i) => (
            <div key={i} className={styles.proofPoint}>
              <span className={styles.proofIcon} aria-hidden="true">✓</span>
              <span>{point}</span>
            </div>
          ))}
        </div>

        <p className={styles.privacyNote}>
          🔒 {copy.landing.privacyNote}
        </p>
      </div>
    </main>
  );
}
