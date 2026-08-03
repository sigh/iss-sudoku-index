// Title: Unique Japanese Sum Sudoku
// Author: tesseralis
// Video: https://www.youtube.com/watch?v=dNd7yrC26Tk
// Source: https://app.crackingthecryptic.com/sudoku/L42nqPggLN

// Normal sudoku (9x9, standard boxes). Digits joined by a white dot are
// consecutive. Japanese sums: each row/column clue stack outside the grid
// names the sums of the contiguous shaded runs in that line (multiple runs
// separated by >=1 unshaded cell); shading itself is otherwise unconstrained
// bookkeeping, not a rule of its own. Every clue value is unknown -- each is
// drawn as a no-total single-cell cage ("a unique positive number") or a "?"
// mark ("any positive number"), never as a printed total -- so each clue is
// modelled as an aux variable tied to whichever run it names, not a
// constant. A clue stack reads nearest-to-farthest = first-to-last run
// entering the grid from that edge: the standard outside-clue-stack
// convention (Skyscraper/X-Sum/Sandwich family), which the rules text does
// not restate because the drawn stacking already fixes the order.
//
// A clue's true range is 1-45 (a shaded run is a subset of one Sudoku line,
// so its digit sum cannot exceed 1+2+...+9), which exceeds ISS's 16-value
// alphabet cap. Each clue is represented as two base-16 digits (hi, lo) with
// value = 16*hi + lo, tied to its run with a coefficient Sum. "Unique
// positive number" cages must pairwise differ as this composite value; "?"
// cells are exempt from that uniqueness check but still tie to their run's
// sum like any other clue.

const shape = new Shape('9x9', '0-15'); // 16-value alphabet for the hi/lo clue digits
const graph = cellGraph('9x9');

// Restrict the playable grid back to ordinary Sudoku digits.
const gridCells = graph.cells();
const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// White dots (Kropki-consecutive), from the edge-marker overlays.
const whiteDots = [
  ['R1C6', 'R2C6'],
  ['R2C5', 'R2C6'],
  ['R5C3', 'R6C3'],
  ['R8C5', 'R9C5'],
].map(([a, b]) => new WhiteDot(a, b));

// --- Outside Japanese-sum clue stacks -------------------------------------
// One entry per line; `slots` lists each clue position nearest-to-farthest
// from the grid: 'cage' (a no-total cage, joins the global uniqueness check)
// or 'q' (a "?" mark, exempt). Transcribed from the drawn cage cells and the
// "?" text marks outside the grid.
const LINES = [
  { dir: 'row', n: 1, slots: ['cage', 'cage', 'cage', 'cage', 'cage'] }, // R5
  { dir: 'row', n: 2, slots: ['cage', 'cage', 'cage'] },                 // R6
  { dir: 'row', n: 3, slots: ['cage'] },                                 // R7
  { dir: 'row', n: 4, slots: ['cage', 'q'] },                            // R8
  { dir: 'row', n: 5, slots: ['q', 'cage'] },                            // R9
  { dir: 'row', n: 6, slots: ['cage', 'q'] },                            // R10
  { dir: 'row', n: 7, slots: ['cage'] },                                 // R11
  { dir: 'row', n: 8, slots: ['cage', 'q'] },                            // R12
  { dir: 'row', n: 9, slots: ['cage', 'cage'] },                         // R13
  { dir: 'col', n: 1, slots: ['cage'] },                                 // C6
  { dir: 'col', n: 2, slots: ['cage', 'cage'] },                         // C7
  { dir: 'col', n: 3, slots: ['cage'] },                                 // C8
  { dir: 'col', n: 4, slots: ['cage', 'cage', 'cage', 'cage'] },         // C9
  { dir: 'col', n: 5, slots: ['cage'] },                                 // C10
  { dir: 'col', n: 6, slots: ['cage', 'cage'] },                         // C11
  { dir: 'col', n: 7, slots: ['cage'] },                                 // C12
  { dir: 'col', n: 8, slots: ['cage', 'cage', 'cage'] },                 // C13
  { dir: 'col', n: 9, slots: ['cage', 'cage'] },                         // C14
];

const lineCells = (line) => (line.dir === 'row' ? graph.row(line.n) : graph.column(line.n));

// Assign each slot a global index into the hi/lo Var groups, in LINES order.
const slotCount = LINES.reduce((n, line) => n + line.slots.length, 0);
const clueHi = new Var('JH', 'Japanese sum clue value (hi base-16 digit)', slotCount);
const clueLo = new Var('JL', 'Japanese sum clue value (lo base-16 digit)', slotCount);

let nextSlot = 1;
for (const line of LINES) {
  line.slotVars = line.slots.map(() => {
    const idx = nextSlot++;
    return { hi: clueHi.cell(idx), lo: clueLo.cell(idx) };
  });
}

// Every (start,end) 0-indexed inclusive placement of exactly k contiguous
// runs (length >= 1 each) over an n-cell line, with >= 1 unshaded cell
// between consecutive runs; any amount of unshaded slack before the first or
// after the last run is allowed.
function runPlacements(k, n) {
  const results = [];
  function rec(remaining, pos, segs) {
    if (remaining === 0) { results.push(segs.slice()); return; }
    const start = pos + 1 + (segs.length > 0 ? 1 : 0);
    const maxStart = n - (remaining + (remaining - 1));
    for (let s = start; s <= maxStart; s++) {
      const maxLen = n - s - (remaining - 1) * 2;
      for (let len = 1; len <= maxLen; len++) {
        const e = s + len - 1;
        segs.push([s, e]);
        rec(remaining - 1, e, segs);
        segs.pop();
      }
    }
  }
  rec(k, -1, []);
  return results;
}

// For each line, the shading is unknown: enumerate every run-count-matching
// placement, and require that at least one holds, tying each run's digit sum
// to its clue slot's (hi, lo) value in that placement.
const japaneseSums = LINES.map((line) => {
  const cells = lineCells(line);
  const placements = runPlacements(line.slots.length, cells.length);
  const options = placements.map((segs) => new And(segs.map(([s, e], i) => {
    const { hi, lo } = line.slotVars[i];
    return new Sum(0, ...cells.slice(s, e + 1), [hi, -16], [lo, -1]);
  })));
  return new Or(options);
});

// "Each caged cell represents a unique positive number": every cage slot's
// composite (hi, lo) value must differ from every other cage slot's, across
// the whole puzzle. "?" slots are exempt (any positive number, repeats allowed).
// A composite value differs iff its hi digit differs or its lo digit does,
// each of which is exactly a two-cell AllDifferent.
const cageSlots = LINES.flatMap(
  (line) => line.slotVars.filter((_, i) => line.slots[i] === 'cage'));
const uniqueClues = [];
for (let i = 0; i < cageSlots.length; i++) {
  for (let j = i + 1; j < cageSlots.length; j++) {
    uniqueClues.push(new Or([
      new AllDifferent(cageSlots[i].hi, cageSlots[j].hi),
      new AllDifferent(cageSlots[i].lo, cageSlots[j].lo),
    ]));
  }
}

return [
  shape,
  digitDomain,
  clueHi,
  clueLo,
  ...whiteDots,
  ...japaneseSums,
  ...uniqueClues,
];
