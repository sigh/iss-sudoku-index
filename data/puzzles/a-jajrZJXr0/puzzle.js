// Sums and Differences by alarark50
// https://sudokupad.app/qj4kzxhp02
// https://www.youtube.com/watch?v=a-jajrZJXr0
//
// Normal 9x9 sudoku + thermometers, Kropki black dots, little-killer diagonals,
// and "sums and differences" navy lines. Counting cells from the circled end,
// every n-th cell is the SUM of its two line-neighbours and every m-th cell is
// their absolute DIFFERENCE; n and m are unknown and shared by both lines.
//
// Each rule is one multiSegment NFA run across BOTH lines, so the period it
// searches is shared over the segment break rather than enumerated as an Or of
// (n,m) hypotheses. (Same technique as the repo's hand-written reference
// data/scripts/sums_and_differences.js.)

// The two navy lines, listed from the circled end.
const navyLines = [
  ['R2C2', 'R1C3', 'R2C4', 'R3C4', 'R4C3', 'R5C3', 'R6C2', 'R7C2', 'R8C3',
    'R9C4', 'R8C5', 'R8C6', 'R8C7', 'R7C7', 'R6C6', 'R5C6', 'R4C5', 'R3C6'],
  ['R2C9', 'R3C8', 'R4C9', 'R5C8', 'R6C8', 'R6C9'],
];

// The first n-th cell sits at position = period, so the period must land inside
// the shorter line to constrain it at all.
const shortestLineLen = Math.min(...navyLines.map(line => line.length));
const PERIODS = [];
for (let period = 2; period < shortestLineLen; period++) PERIODS.push(period);

// One machine per rule. `relation(left, cell, right)` is what a designated cell
// must satisfy. State { period, phase, window }: the shared period being tried,
// how many steps into the current period we are, and the last two digits read.
const periodMachine = (relation) => NFA.encodeSpec({
  startState: PERIODS.map(period => ({ period, phase: 0, window: [] })),
  transition: ({ period, phase, window }, value) => {
    if (value === SEGMENT_BREAK) return { period, phase: 0, window: [] };
    window.push(value);
    if (phase === 0 && window.length === 3) {
      if (!relation(...window)) return undefined;   // the designated cell fails
    }
    return { period, phase: (phase + 1) % period, window: window.slice(-2) };
  },
  accept: () => true,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),

  // Navy lines: one shared sum period, one shared difference period.
  new NFA(periodMachine((left, cell, right) => cell === left + right),
    'sum-period', ...navyLines),
  new NFA(periodMachine((left, cell, right) => cell === Math.abs(left - right)),
    'diff-period', ...navyLines),

  // Thermometers (strictly increasing bulb -> tip).
  new Thermo('R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R4C2'),
  new Thermo('R8C3', 'R7C4', 'R6C3', 'R5C3', 'R4C3', 'R3C2'),
  new Thermo('R5C5', 'R4C5', 'R3C5'),

  // Kropki black dots (2:1 ratio).
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R3C8', 'R4C8'),
  new BlackDot('R4C7', 'R4C8'),
  new BlackDot('R4C9', 'R5C9'),

  // Little killer diagonals (sum along the diagonal, digits may repeat).
  new LittleKiller('R7C1', 14),
  new LittleKiller('R2C9', 10),
];
