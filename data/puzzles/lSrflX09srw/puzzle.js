// Title: Akari Sudoku
// Author: Andrej Boban
// Video: https://www.youtube.com/watch?v=lSrflX09srw
// Source: https://cracking-the-cryptic.web.app/sudoku/h7HNDjhjqf

// Rules encoded:
// - Normal sudoku (rows/columns/boxes, all default).
// - The 16 grey cells below (fixed, drawn) are never lightbulbs; the other
//   65 "white" cells are candidates. Exactly two white cells in every
//   row/column/box hold a lightbulb (LB).
// - An LB lights its own cell plus its row/column outward until a grey cell
//   or the grid edge -- so the grey cells cut every row/column's white
//   cells into maximal unbroken runs ("segments"), and a light never
//   crosses a segment boundary.
// - No LB may illuminate another LB: since light fills a whole segment, this
//   means no segment holds more than one LB (LBs in different segments
//   never interact -- a grey cell already separates them).
// - Every white cell must be illuminated: its row segment or column segment
//   (or both) must hold an LB.
// - A grey cell's digit reports the count of orthogonally adjacent LBs: 0
//   adjacent -> 8 or 9; n adjacent (1-4) -> exactly n. (No two grey cells
//   are orthogonally adjacent here, so this only ever scans white
//   neighbours.)
// - An LB cell always holds 5, 6 or 7. A non-LB white cell may hold any
//   digit.

const graph = cellGraph('9x9');

// Grey-cell fills, read from the raw payload's underlay array.
const GREY = [
  'R1C1', 'R1C5', 'R1C9', 'R2C7', 'R3C3', 'R4C4', 'R4C6', 'R5C5',
  'R5C9', 'R6C1', 'R6C8', 'R7C2', 'R7C7', 'R8C6', 'R9C4', 'R9C9',
];
const greySet = new Set(GREY);
const isWhite = cell => !greySet.has(cell);
const WHITE = graph.cells().filter(isWhite);

// Given digits, read from the raw payload's cell values.
const GIVENS = [
  ['R1C5', 9], ['R3C1', 5], ['R3C8', 6], ['R5C7', 7],
  ['R6C5', 3], ['R7C4', 4], ['R9C1', 4], ['R9C9', 8],
];

// Lightbulb flag: one per white cell, 1 = not a lightbulb, 2 = lightbulb
// (the domain-restriction-flag convention used throughout this codebase).
const flagOverlay = graph.makeOverlay('VL', WHITE);
const flagVar = flagOverlay.toVar('lightbulb flag');
const flagOf = cell => flagOverlay.at(cell);
const flagDomain = flagOverlay.makeReplicate(new Given(flagOverlay.cells()[0], 1, 2));

// Exactly two lightbulbs among the white cells of every row/column/box. A
// flag sums to (whiteCount - lbCount)*1 + lbCount*2 = whiteCount + lbCount,
// so pinning the sum to whiteCount + 2 pins lbCount to 2.
const units = [...graph.rows(), ...graph.columns(), ...graph.boxes()];
const unitCounts = units.map(unit => {
  const cells = flagOverlay.at(unit.filter(isWhite));
  return new Sum(cells.length + 2, ...cells);
});

// Split a row/column into its maximal runs of white cells (segments), each
// cut apart by the grey cells that block the light.
const segmentsOf = line => {
  const segs = [];
  let run = [];
  for (const cell of line) {
    if (isWhite(cell)) {
      run.push(cell);
    } else if (run.length) {
      segs.push(run);
      run = [];
    }
  }
  if (run.length) segs.push(run);
  return segs;
};
const segments = [...graph.rows().flatMap(segmentsOf), ...graph.columns().flatMap(segmentsOf)];

// One "lit" flag per segment (1 = no lightbulb in it, 2 = exactly one). A
// segment's flags sum to segLen (no LB) or segLen + 1 (one LB) and never
// higher, so the single equation `sum(flags) - lit = segLen - 1` both
// defines `lit` from the segment's own flags *and* forbids two lightbulbs
// sharing a segment (a second LB would need lit = 3, outside its domain) --
// which is exactly the "no LB illuminates another LB" rule, since two LBs
// in one unbroken run always light each other. A length-1 segment reduces
// to plain equality (its one flag *is* the lit flag), so that case uses
// SameValues instead of a trivial one-cell Sum.
const litVar = new Var('VS', 'segment lit', segments.length);
const litOf = new Map(); // white cell -> [row-segment lit cell, column-segment lit cell]
const segmentTies = segments.flatMap((seg, i) => {
  const lit = litVar.cell(i + 1);
  for (const cell of seg) {
    const pair = litOf.get(cell) || [];
    pair.push(lit);
    litOf.set(cell, pair);
  }
  const flags = flagOverlay.at(seg);
  const tie = flags.length === 1
    ? new SameValues(2, flags[0], lit)
    : new Sum(seg.length - 1, ...flags, [lit, -1]);
  return [new Given(lit, 1, 2), tie];
});

// Every white cell must be illuminated: its row segment or its column
// segment holds a lightbulb. (An LB cell always satisfies this through its
// own segment.)
const illumination = WHITE.map(cell => {
  const [rowLit, colLit] = litOf.get(cell);
  return new Or([new Given(rowLit, 2), new Given(colLit, 2)]);
});

// A lightbulb cell always holds 5, 6 or 7; a non-lightbulb white cell may
// hold any digit, so the relation is one-directional.
const lbDigitKey = Pair.fnToKey(
  (flag, digit) => flag !== 2 || digit === 5 || digit === 6 || digit === 7, 9);
const lbDigitLinks = WHITE.map(cell => new Pair(lbDigitKey, 'LB value 5-7', flagOf(cell), cell));

// Grey-cell clues: the digit reports the count of orthogonally adjacent
// lightbulbs (0 -> 8 or 9; n in 1-4 -> exactly n). Each is one small NFA
// scanning that cell's neighbour flags (order irrelevant, since only the
// count matters) followed by the grey cell's own digit; the running LB
// count is clamped to state via how many neighbour inputs remain.
const greyClues = GREY.map(cell => {
  const neighbours = flagOverlay.at(graph.neighbours(cell).filter(isWhite));
  const k = neighbours.length;
  const spec = NFA.encodeSpec({
    startState: k === 0 ? { phase: 'digit', count: 0 } : { phase: 'count', remaining: k, count: 0 },
    transition: (state, value) => {
      if (state.phase === 'count') {
        const remaining = state.remaining - 1;
        const count = state.count + (value === 2 ? 1 : 0);
        return remaining === 0 ? { phase: 'digit', count } : { phase: 'count', remaining, count };
      }
      // state.phase === 'digit': value is the grey cell's own digit.
      const ok = state.count === 0
        ? (value === 8 || value === 9)
        : (value === state.count);
      return { phase: 'accept', ok };
    },
    accept: state => state.phase === 'accept' && state.ok,
  }, 9);
  return new NFA(spec, 'grey clue', ...neighbours, cell);
});

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  flagVar,
  flagDomain,
  ...unitCounts,
  litVar,
  ...segmentTies,
  ...illumination,
  ...lbDigitLinks,
  ...greyClues,
];
