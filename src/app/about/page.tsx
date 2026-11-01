'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <main className={styles.about}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>

        <h1 className={styles.title}>About Plan Taiyari</h1>
        <p className={styles.subtitle}>Celebration and Event Planner</p>

        {/* What It Is */}
        <section className={styles.section}>
          <h2>What is Plan Taiyari?</h2>
          <p>
            Plan Taiyari is a free, privacy-first event planning tool for first-time
            organisers in India. Whether you&apos;re planning a birthday party, wedding, or
            community event, it helps you create a realistic plan with budgets, timelines,
            vendor checklists, and personalised ideas — all without needing prior experience.
          </p>
        </section>

        {/* Problem It Solves */}
        <section className={styles.section}>
          <h2>The Problem We Solve</h2>
          <p>
            First-time event organisers face a steep learning curve. They don&apos;t know what
            vendors to hire, how much things cost, what order to do things in, or what
            they&apos;re forgetting. Existing tools are either too complex (designed for
            professionals) or too simple (just checklists with no budget intelligence).
          </p>
          <p>
            Plan Taiyari bridges this gap with an intelligent planner that understands Indian
            celebrations — from Haldi ceremonies to mehendi nights, from catering per-plate
            costs to decorator packages.
          </p>
        </section>

        {/* What It Does */}
        <section className={styles.section}>
          <h2>What It Does</h2>
          <ul className={styles.featureList}>
            <li>
              <strong>Smart Budget Allocation</strong> — Distributes your budget across
              categories using weighted allocation with Indian-market defaults
            </li>
            <li>
              <strong>What-If Scenarios</strong> — See how changing guest count or budget
              affects every category instantly
            </li>
            <li>
              <strong>Dependency-Aware Timeline</strong> — Tasks are ordered correctly
              (book venue before sending invites) with critical path highlighting
            </li>
            <li>
              <strong>Vendor Checklists</strong> — Know exactly what to ask each vendor,
              compare quotes side-by-side, track payments
            </li>
            <li>
              <strong>Personalised Ideas</strong> — Get suggestions based on your event type,
              budget, and preferences
            </li>
            <li>
              <strong>Event Day Mode</strong> — A run sheet, vendor contacts, and day-before
              checklist for the big day
            </li>
          </ul>
        </section>

        {/* What It Doesn't Do */}
        <section className={styles.section}>
          <h2>What It Doesn&apos;t Do</h2>
          <ul className={styles.limitList}>
            <li>Does not book vendors or process payments</li>
            <li>Does not store your data on any server — everything stays in your browser</li>
            <li>Does not provide legally binding contracts or advice</li>
            <li>Does not guarantee vendor availability or pricing accuracy</li>
            <li>Does not replace professional event planners for complex, large-scale events</li>
          </ul>
        </section>

        {/* Privacy */}
        <section className={styles.section}>
          <h2>Your Privacy</h2>
          <p>
            All your data stays on your device in localStorage. We don&apos;t collect,
            transmit, or store any personal information. No analytics, no cookies, no
            tracking. You can export your data as JSON anytime, and delete everything with
            one click in Settings.
          </p>
          <p>
            <Link href="/privacy" className={styles.link}>
              Read our full privacy policy →
            </Link>
          </p>
        </section>

        {/* Tech Stack */}
        <section className={styles.section}>
          <h2>Built With</h2>
          <div className={styles.techGrid}>
            <div className={styles.techItem}>
              <strong>Next.js</strong>
              <span>React framework</span>
            </div>
            <div className={styles.techItem}>
              <strong>TypeScript</strong>
              <span>Type-safe code</span>
            </div>
            <div className={styles.techItem}>
              <strong>Zustand</strong>
              <span>State management</span>
            </div>
            <div className={styles.techItem}>
              <strong>Zod</strong>
              <span>Schema validation</span>
            </div>
            <div className={styles.techItem}>
              <strong>CSS Modules</strong>
              <span>Scoped styling</span>
            </div>
            <div className={styles.techItem}>
              <strong>localStorage</strong>
              <span>Client-side storage</span>
            </div>
          </div>
        </section>

        {/* Traceability */}
        <section className={styles.section}>
          <h2>Feature Traceability</h2>
          <p className={styles.traceNote}>
            Every feature maps to a requirement in our Product Requirements Document.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.traceTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>PRD Section</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>F1 — Intake</td><td>§6.1</td><td>Guided brief collection</td></tr>
                <tr><td>F2 — Budget</td><td>§6.2</td><td>Smart allocation &amp; what-if</td></tr>
                <tr><td>F3 — Timeline</td><td>§6.3</td><td>Dependency-aware tasks</td></tr>
                <tr><td>F4 — Vendors</td><td>§6.4</td><td>Checklists &amp; comparison</td></tr>
                <tr><td>F5 — Assistant</td><td>§6.5</td><td>Guided suggestions</td></tr>
                <tr><td>F6 — Ideas</td><td>§6.6</td><td>Personalised ideas</td></tr>
                <tr><td>F7 — Event Day</td><td>§6.7</td><td>Run sheet &amp; contacts</td></tr>
                <tr><td>F8 — Export</td><td>§6.8</td><td>PDF, ICS, text, JSON</td></tr>
                <tr><td>F9 — Settings</td><td>§6.9</td><td>Theme, accessibility</td></tr>
                <tr><td>F10 — Privacy</td><td>§6.10</td><td>Local-only data</td></tr>
                <tr><td>F11 — Observability</td><td>§6.11</td><td>Health &amp; diagnostics</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Made with care for first-time event organisers in India.</p>
          <p className={styles.version}>Version 1.0.0</p>
        </footer>
      </div>
    </main>
  );
}
