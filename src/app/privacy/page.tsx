'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function PrivacyPage() {
  return (
    <main className={styles.privacy}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>

        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: November 2026</p>

        <section className={styles.section}>
          <h2>The Short Version</h2>
          <div className={styles.highlight}>
            <p>
              <strong>Your data never leaves your device.</strong> Plan Taiyari stores
              everything in your browser&apos;s localStorage. We have no servers collecting
              your information, no analytics, no cookies, and no tracking of any kind.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>What Data We Store</h2>
          <p>Plan Taiyari stores the following data locally on your device:</p>
          <ul>
            <li>Your event details (type, date, guest count, budget)</li>
            <li>Budget allocations and what-if scenarios</li>
            <li>Timeline tasks and their completion status</li>
            <li>Vendor information and quotes you enter</li>
            <li>Ideas you&apos;ve pinned or dismissed</li>
            <li>App settings (theme, accessibility preferences)</li>
            <li>Undo/redo history and plan snapshots</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Where Data Lives</h2>
          <p>
            All data is stored in your browser&apos;s <code>localStorage</code>. This means:
          </p>
          <ul>
            <li>Data stays on your device only</li>
            <li>Data persists between browser sessions</li>
            <li>Clearing browser data will delete your plan</li>
            <li>Data is not synced across devices or browsers</li>
            <li>No one else can access your data unless they use your browser</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>What We Don&apos;t Do</h2>
          <ul className={styles.noneList}>
            <li>We do not collect any personal information</li>
            <li>We do not use cookies or tracking pixels</li>
            <li>We do not run analytics or telemetry</li>
            <li>We do not share data with third parties</li>
            <li>We do not use advertising</li>
            <li>We do not send any network requests with your data</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Data Export &amp; Deletion</h2>
          <p>You have full control over your data:</p>
          <ul>
            <li>
              <strong>Export:</strong> Go to Settings → Export to download your entire plan
              as a JSON file that you can save or transfer
            </li>
            <li>
              <strong>Import:</strong> Go to Settings → Import to load a previously
              exported plan
            </li>
            <li>
              <strong>Delete:</strong> Go to Settings → Delete All Data to permanently
              remove everything from localStorage
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Services</h2>
          <p>
            Plan Taiyari does not use any third-party services. The app is fully
            self-contained and runs entirely in your browser. There are no CDNs loading
            external resources, no API calls to external services, and no embedded
            third-party content.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Data Integrity</h2>
          <p>
            Plan Taiyari validates your data using Zod schemas every time the app loads. If
            stored data is found to be corrupt or incompatible with a new version, it is
            quarantined under a separate key (<code>plan-taiyari-quarantine</code>) so you
            can recover it, and the app starts fresh.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Children&apos;s Privacy</h2>
          <p>
            Plan Taiyari does not collect any data from anyone, including children. Since
            all data remains local, there are no age-related concerns.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to This Policy</h2>
          <p>
            If this policy changes, we&apos;ll update the &quot;Last updated&quot; date at the top.
            Since we collect no data, policy changes would only reflect new features or
            clarifications.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Questions?</h2>
          <p>
            Plan Taiyari is an open-source project. If you have questions about privacy,
            you can review the source code to verify these claims — the code is the policy.
          </p>
        </section>

        <footer className={styles.footer}>
          <Link href="/about" className={styles.link}>← About Plan Taiyari</Link>
        </footer>
      </div>
    </main>
  );
}
