// Month keys ('YYYY-MM') are the resolution the index is filtered and charted
// at. The format is shared by the URL contract, the date filter and the
// timeline strip, so it lives here rather than in any one of them.

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function isMonth(value) {
  return typeof value === 'string' && MONTH_RE.test(value);
}

export function monthOf(row) {
  return (row.date || '').slice(0, 7);
}

export function monthLabel(month) {
  const [year, index] = month.split('-');
  return `${MONTH_NAMES[Number(index) - 1]} ${year}`;
}

function nextMonth(month) {
  const [year, index] = month.split('-').map(Number);
  return index === 12
    ? `${year + 1}-01`
    : `${year}-${String(index + 1).padStart(2, '0')}`;
}

// Inclusive on both ends; a null edge means unbounded. Month keys compare
// correctly as plain strings, so no date parsing is needed anywhere.
export function monthInRange(month, from, to) {
  return (!from || month >= from) && (!to || month <= to);
}

// Undated rows are never filtered out by a date range.
export function inRange(row, from, to) {
  const month = monthOf(row);
  return !month || monthInRange(month, from, to);
}

// Every month between the earliest and latest row, including the empty ones:
// the gaps in the published index are a fact about coverage, and collapsing
// them would hide it.
export function monthDomain(rows) {
  let min = '';
  let max = '';
  for (const row of rows) {
    const month = monthOf(row);
    if (!month) continue;
    if (!min || month < min) min = month;
    if (!max || month > max) max = month;
  }
  if (!min) return [];
  const months = [];
  for (let month = min; month <= max; month = nextMonth(month)) months.push(month);
  return months;
}
