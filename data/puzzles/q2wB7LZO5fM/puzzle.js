// Title: Seventeen Fives
// Author: R. Mullinix
// Video: https://www.youtube.com/watch?v=q2wB7LZO5fM
// Source: https://sudokupad.app/18arjzoqpi

// Normal sudoku on the drawn 3x3 boxes (Shape's default regions).
//
// Middlers: nine cells, one per row/column/box, hold pairwise-different
// digits. Wherever another rule reads "the value" of a Middler cell, that
// value is 5 regardless of the digit actually in the cell. Model with a
// parallel flag overlay (2 = Middler, 1 = not), one flagged cell per house,
// and read each row's single flagged digit into an auxiliary cell so the
// nine Middler digits can be checked pairwise-different directly.
//
// German Whispers / V / X / Kropki / Palindrome all read effective values
// (digit, or 5 if the cell is a Middler), so every one of their pairwise
// relations is a 4-symbol NFA scanning [digitA, flagA, digitB, flagB]: it
// resolves each side to its effective value, then checks the rule.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VM');
const flag = cell => flags.at(cell);

// Every flag cell is a shifted copy of the same {1, 2} domain restriction.
const flagOrigin = flags.cells()[0];
const flagDomain = flags.makeReplicate(new Given(flagOrigin, 1, 2));

// Effective-value pairwise rule: resolve each side to 5 (if its flag reads
// Middler) or its digit, then check predicate(effA, effB). Phases move
// strictly forward (digitA -> flagA -> digitB -> flagB -> done) and any
// symbol past 'done' is rejected, so the reachable state set stays small
// regardless of how many cells a caller feeds in (a plain climbing step
// index would grow without bound and blow the state cap).
const edgeSpec = predicate => NFA.encodeSpec({
  startState: { phase: 'digitA', pending: 0, effA: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'digitA':
        return { phase: 'flagA', pending: value, effA: 0 };
      case 'flagA':
        return { phase: 'digitB', pending: 0, effA: value === 2 ? 5 : state.pending };
      case 'digitB':
        return { phase: 'flagB', pending: value, effA: state.effA };
      case 'flagB':
        return { phase: 'done', pending: 0, effA: state.effA, effB: value === 2 ? 5 : state.pending };
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done' && predicate(state.effA, state.effB),
}, 9);

const SUM5 = edgeSpec((a, b) => a + b === 5);
const SUM10 = edgeSpec((a, b) => a + b === 10);
const CONSECUTIVE = edgeSpec((a, b) => Math.abs(a - b) === 1);
const WHISPER = edgeSpec((a, b) => Math.abs(a - b) >= 5);
const PALINDROME_EQ = edgeSpec((a, b) => a === b);

const edge = (spec, label, a, b) => new NFA(spec, label, a, flag(a), b, flag(b));
const chainEdges = (spec, label, cells) =>
  cells.slice(0, -1).map((a, i) => edge(spec, label, a, cells[i + 1]));
const mirrorEdges = (spec, label, cells) =>
  cells.slice(0, Math.floor(cells.length / 2))
    .map((a, i) => edge(spec, label, a, cells[cells.length - 1 - i]));

// V/X clue cells and Kropki dots, read from the drawn edge badges.
const V_CLUES = [['R2C4', 'R3C4']];
const X_CLUES = [
  ['R1C1', 'R1C2'], ['R4C4', 'R5C4'], ['R7C7', 'R7C8'],
  ['R5C6', 'R6C6'], ['R6C8', 'R7C8'],
];
const KROPKI_DOTS = [['R5C3', 'R5C4'], ['R6C3', 'R6C4'], ['R9C3', 'R9C4']];

// Line occupancy from the drawn waypoints (straight segments cover every
// cell they pass through, not just the turning points).
const WHISPER_LINES = [
  ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R5C4', 'R6C4', 'R7C4', 'R8C4'],
];
const PALINDROME_LINES = [
  ['R9C1', 'R8C1', 'R7C2', 'R6C3', 'R5C3', 'R5C2', 'R4C2'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C6', 'R7C6'],
];

// Each row's Middler digit, read off that row's single flagged cell, so the
// nine Middler digits can be checked pairwise-different with one AllDifferent.
// Segment 1 scans the row's interleaved [digit, flag] pairs (phase toggles
// digit/flag -- it never climbs, so it stays bounded for any row length);
// segment 2 is the single derived cell that must match the found digit.
const midDigit = new Var('E', 'row Middler digit', 9);
const rowMidSpec = NFA.encodeSpec({
  startState: { phase: 'digit', pending: 0, found: null },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'digit' ? { phase: 'final', pending: 0, found: state.found } : undefined;
    }
    switch (state.phase) {
      case 'digit':
        return { phase: 'flag', pending: value, found: state.found };
      case 'flag':
        return { phase: 'digit', pending: 0, found: value === 2 ? state.pending : state.found };
      case 'final':
        return { phase: 'done', pending: 0, found: state.found, final: value };
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done' && state.found !== null && state.found === state.final,
}, 9, { multiSegment: true });
const interleave = cells => cells.flatMap(c => [c, flag(c)]);
const rowMidConstraints = graph.rows().map((row, i) =>
  new NFA(rowMidSpec, `row ${i + 1} Middler digit`, interleave(row), [midDigit.cell(i + 1)]));

return [
  new Shape('9x9'),

  // Middler flags: a boolean overlay (2 = Middler), exactly one per house.
  flags.toVar('Middler flags'),
  flagDomain,
  ...graph.houses().map(house => new Sum(10, ...flags.at(house))),
  midDigit,
  ...rowMidConstraints,
  new AllDifferent(...midDigit.cells()),

  // V / X clues (effective sum 5 / 10).
  ...V_CLUES.map(([a, b]) => edge(SUM5, 'V', a, b)),
  ...X_CLUES.map(([a, b]) => edge(SUM10, 'X', a, b)),

  // Kropki white dots (effective consecutive values).
  ...KROPKI_DOTS.map(([a, b]) => edge(CONSECUTIVE, 'Kropki dot', a, b)),

  // German Whispers (effective adjacent difference >= 5).
  ...WHISPER_LINES.flatMap(line => chainEdges(WHISPER, 'German Whisper', line)),

  // Palindromes (effective values equal, mirrored around the line centre).
  ...PALINDROME_LINES.flatMap(line => mirrorEdges(PALINDROME_EQ, 'Palindrome', line)),
];
