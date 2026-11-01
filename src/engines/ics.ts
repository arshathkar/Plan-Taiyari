/**
 * ICS Calendar Export (§7.9)
 * Generates RFC 5545 .ics files for task deadlines.
 */

interface IcsTask {
  id: string;
  title: string;
  latestFinish: string; // YYYY-MM-DD
}

/**
 * Build an ICS calendar string for task deadlines.
 * All-day events at each task's must-finish-by date.
 */
export function buildIcs(tasks: IcsTask[], planId: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plan Taiyari//Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Plan Taiyari Tasks',
  ];

  for (const task of tasks) {
    const uid = `${task.id}-${planId}@plantaiyari.local`;
    const dateStr = task.latestFinish.replace(/-/g, '');
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${escapeIcs(uid)}`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`SUMMARY:${escapeIcs(task.title)}`);
    lines.push(`DESCRIPTION:${escapeIcs(`Plan Taiyari task: ${task.title}`)}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // Fold lines at 75 octets and use CRLF
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Escape special characters for ICS text fields */
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Fold a line at 75 octets per RFC 5545 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;

  const parts: string[] = [];
  let remaining = line;

  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);

  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }

  return parts.join('\r\n');
}
