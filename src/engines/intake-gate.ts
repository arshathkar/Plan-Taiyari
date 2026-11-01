/**
 * Intake Gate Engine (§7.6)
 * Determines if the intake is complete enough to generate a plan.
 */
import type { Intake } from '@/domain/schema';

/** Fixed question order per F1.3 */
const QUESTION_ORDER = [
  'eventType', 'date', 'guests', 'budget',
  'mustHaves', 'dietary', 'accessibility', 'cultural',
  'desiredExperience', 'venueType', 'city',
] as const;

/** Required fields that must be answered before plan generation */
const REQUIRED_FIELDS = [
  'eventType', 'date', 'guests', 'budget',
  'mustHaves', 'dietary', 'accessibility', 'cultural',
] as const;

type FieldId = (typeof QUESTION_ORDER)[number];

/**
 * Check if a field has been answered in the intake.
 */
function isFieldAnswered(intake: Intake, field: FieldId): boolean {
  switch (field) {
    case 'eventType':
      return intake.eventType !== null;
    case 'date':
      return intake.date !== null;
    case 'guests':
      return intake.guests !== null && intake.guests.expected >= 1;
    case 'budget':
      return intake.budget !== null && intake.budget.amountInr >= 1000;
    case 'mustHaves':
      return intake.answered.mustHaves === true;
    case 'dietary':
      return intake.answered.dietary === true;
    case 'accessibility':
      return intake.answered.accessibility === true;
    case 'cultural':
      return intake.answered.cultural === true;
    case 'desiredExperience':
      return intake.desiredExperience.length > 0 || intake.experienceChips.length > 0;
    case 'venueType':
      return intake.venueType !== 'undecided';
    case 'city':
      return !!intake.city && intake.city.length > 0;
    default:
      return false;
  }
}

/** Human-readable labels for fields */
const FIELD_LABELS: Record<FieldId, string> = {
  eventType: 'event type',
  date: 'event date',
  guests: 'guest count',
  budget: 'budget',
  mustHaves: 'must-haves',
  dietary: 'dietary needs',
  accessibility: 'accessibility needs',
  cultural: 'cultural considerations',
  desiredExperience: 'desired experience',
  venueType: 'venue type',
  city: 'city',
};

/**
 * Returns ordered list of unanswered required fields.
 */
export function missingFields(intake: Intake): string[] {
  return REQUIRED_FIELDS.filter(f => !isFieldAnswered(intake, f)).map(f => FIELD_LABELS[f]);
}

/**
 * Returns the field ID of the next unanswered question in order.
 */
export function nextQuestion(intake: Intake): FieldId | null {
  for (const field of QUESTION_ORDER) {
    if (!isFieldAnswered(intake, field)) {
      return field;
    }
  }
  return null;
}

/**
 * Returns the next question's label for display.
 */
export function nextQuestionLabel(intake: Intake): string | null {
  const field = nextQuestion(intake);
  return field ? FIELD_LABELS[field] : null;
}

/**
 * Check if the intake gate is passed (ready to generate a plan).
 * Per F1.4: eventType set, date set or undecided with horizon,
 * guests >= 1, budget >= ₹1000, and mustHaves/dietary/accessibility/cultural answered.
 */
export function isReadyToPlan(intake: Intake): boolean {
  return missingFields(intake).length === 0;
}

/**
 * Count of answered fields (for progress meter).
 */
export function answeredCount(intake: Intake): { answered: number; total: number } {
  const total = REQUIRED_FIELDS.length;
  const answered = REQUIRED_FIELDS.filter(f => isFieldAnswered(intake, f)).length;
  return { answered, total };
}
