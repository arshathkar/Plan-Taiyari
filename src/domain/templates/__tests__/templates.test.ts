import { describe, it, expect } from 'vitest';
import { getBudgetTemplate } from '../budget-templates';
import { getTaskTemplate } from '../task-templates';
import { getVendorTemplate } from '../vendor-templates';

describe('Domain Templates (§10.3, UT-TPL, R-057)', () => {
  describe('Budget Templates (Appendix B)', () => {
    it('Birthday template has 9 categories with weights summing to 100', () => {
      const template = getBudgetTemplate('birthday');
      expect(template.length).toBe(9);
      const totalWeight = template.reduce((s, c) => s + c.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('Wedding template has 11 categories with weights summing to 100', () => {
      const template = getBudgetTemplate('wedding');
      expect(template.length).toBe(11);
      const totalWeight = template.reduce((s, c) => s + c.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('Community template has 10 categories with weights summing to 100', () => {
      const template = getBudgetTemplate('community');
      expect(template.length).toBe(10);
      const totalWeight = template.reduce((s, c) => s + c.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Task Templates (Appendix A)', () => {
    it('Birthday template has 20 tasks (B01–B20)', () => {
      const tasks = getTaskTemplate('birthday');
      expect(tasks.length).toBe(20);
      expect(tasks[0].id).toBe('B01');
      expect(tasks[tasks.length - 1].id).toBe('B20');
    });

    it('Wedding template has 24 tasks (W01–W24)', () => {
      const tasks = getTaskTemplate('wedding');
      expect(tasks.length).toBe(24);
      expect(tasks[0].id).toBe('W01');
      expect(tasks[tasks.length - 1].id).toBe('W24');
    });

    it('Community template has 21 tasks (C01–C21)', () => {
      const tasks = getTaskTemplate('community');
      expect(tasks.length).toBe(21);
      expect(tasks[0].id).toBe('C01');
      expect(tasks[tasks.length - 1].id).toBe('C21');
    });

    it('Every task dependency points to a valid task ID within the template', () => {
      for (const eventType of ['birthday', 'wedding', 'community'] as const) {
        const tasks = getTaskTemplate(eventType);
        const taskIds = new Set(tasks.map(t => t.id));
        for (const task of tasks) {
          for (const dep of task.dependsOn) {
            expect(taskIds.has(dep)).toBe(true);
          }
        }
      }
    });
  });

  describe('Vendor Templates (Appendix C)', () => {
    it('Provides vendor categories with requirements and call questions', () => {
      const templates = getVendorTemplate('birthday');
      expect(templates.length).toBeGreaterThan(0);
      for (const v of templates) {
        expect(v.requirements.length).toBeGreaterThan(0);
        expect(v.questions.length).toBeGreaterThan(0);
      }
    });
  });
});
