'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import styles from './layout.module.css';
import ui from '@/components/ui.module.css';
import { useEffect } from 'react';
import AssistantPanel from '@/components/AssistantPanel';

const NAV_ITEMS = [
  { href: '/plan/overview', label: 'Overview', icon: '📋' },
  { href: '/plan/budget', label: 'Budget', icon: '💰' },
  { href: '/plan/timeline', label: 'Timeline', icon: '📅' },
  { href: '/plan/vendors', label: 'Vendors', icon: '🤝' },
  { href: '/plan/ideas', label: 'Ideas', icon: '💡' },
  { href: '/plan/event-day', label: 'Event Day', icon: '🎉' },
  { href: '/plan/settings', label: 'Settings', icon: '⚙️' },
];

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const plan = usePlanStore(s => s.plan);
  const clearPlan = usePlanStore(s => s.clearPlan);

  // Redirect to landing if no plan
  useEffect(() => {
    if (!plan) router.push('/');
  }, [plan, router]);

  if (!plan) return null;

  const eventTitle = plan.intake.title || `${plan.intake.eventType} event`;
  const guestCount = plan.intake.guests?.expected ?? 0;

  return (
    <div className={styles.layout}>
      {/* Desktop side nav */}
      <nav className={`glass ${styles.nav}`} aria-label="Plan navigation">
        <div className={styles.navBrand}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.navBrandName}>{copy.appName}</div>
            <div className={styles.navBrandSub}>{copy.subtitle}</div>
          </Link>
        </div>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? styles.navLinkActive : styles.navLink}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.main}>
        {/* Header */}
        <header className={`glass ${styles.header}`}>
          <div className={styles.headerInfo}>
            <span className={styles.headerTitle}>{eventTitle}</span>
            <span className={styles.headerMeta}>
              {guestCount} guests · {plan.intake.date?.kind === 'fixed' ? plan.intake.date.date : 'Date TBD'}
            </span>
          </div>
          <span className={`${styles.aiChip} ${ui.statusInfo}`}>
            {copy.ai.off}
          </span>
        </header>

        {/* Sample banner */}
        {plan.isSample && (
          <div className={`${styles.sampleBanner} ${ui.bannerSample}`} role="status">
            <span>📌 {copy.sample.banner}</span>
            <button
              onClick={() => { clearPlan(); router.push('/'); }}
              className={`${ui.btnGhost} ${ui.btnSmall}`}
            >
              {copy.sample.clear}
            </button>
          </div>
        )}

        {/* Page content */}
        <main id="main-content">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`glass--strong ${styles.bottomNav}`} aria-label="Plan navigation">
        {NAV_ITEMS.slice(0, 5).map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.bottomNavLink} ${pathname === item.href ? styles.bottomNavActive : ''}`}
          >
            <span aria-hidden="true" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Assistant panel (F5) */}
      <AssistantPanel />
    </div>
  );
}
