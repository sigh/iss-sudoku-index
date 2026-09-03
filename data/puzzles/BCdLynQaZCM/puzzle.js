// Title: unknown
// Author: BebopKid
// Video: https://www.youtube.com/watch?v=BCdLynQaZCM
// Source: https://app.crackingthecryptic.com/webapp/bHm83hpP6m

// Rows, columns and nine 9-cell shapes all contain 1-9; the shapes are to be
// determined. Clues outside the grid give the sums of each segment, in order,
// in that row/column, a segment being a maximal run of cells of that line
// lying in one shape. A dash clue is a segment whose sum is not shown, so a
// line's clue list also fixes how many segments the line has.
// There are no givens. Nothing is omitted.

// Clue lists, in reading order (left to right for a row, top to bottom for a
// column), transcribed from the grey clue strips that butt against the grid:
// canvas R6-R14 x C1-C7 for the rows, canvas R1-R5 x C8-C16 for the columns.
// null is a dash slot.
const ROW_CLUES = [
  [6, 9, null, null],                   // R1
  [7, 12, null, null, 12],              // R2
  [8, 11, null, null, 5, 9, 2],         // R3
  [5, 7, null, null, 11, 5, 8],         // R4
  [9, 9, null, null, 5, 9, 4],          // R5
  [9, 16, 1, 14, null, null],           // R6
  [5, 11, null, null, null, 3, 7],      // R7
  [null, null, 8, 18, 3, 7],            // R8
  [12, 33],                             // R9
];

const COLUMN_CLUES = [
  [null, 41, null],                     // C1
  [null, null, 13, 13],                 // C2
  [29, 15, 1],                          // C3
  [14, 17, 14],                         // C4
  [31, null, null],                     // C5
  [20, null, null, 7],                  // C6
  [null, null, 10, 15, 8],              // C7
  [8, 6, 21, 10],                       // C8
  [34, 11],                             // C9
];

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// ISS exposes no border mask over the chaos-region labels, so each border gets
// its own flag cell. VH<n> is the border between a cell and its right
// neighbour, VV<n> the border between a cell and its lower neighbour; both are
// held on the pair's own left/upper cell, so the overlays cover columns 1-8
// and rows 1-8 respectively.
const hPairCells = graph.cells().filter(cell => parseCellId(cell).col < 9);
const vPairCells = graph.cells().filter(cell => parseCellId(cell).row < 9);
const vh = graph.makeOverlay('VH', hPairCells);
const vv = graph.makeOverlay('VV', vPairCells);

// Flag values. Only 1 and 2 are ever accepted by the machines below, which is
// what confines these cells to two states.
const SAME = 1;   // the two cells share a shape
const DIFF = 2;   // a shape border runs between them

// Reads [label(a), flag, label(b)] and accepts only when the flag says exactly
// whether the two chaos-region labels differ. `seen` counts cells read so far.
const borderFlagNFA = NFA.encodeSpec({
  startState: { seen: 0, label: 0, flag: 0 },
  transition({ seen, label, flag }, value) {
    if (seen === 0) return { seen: 1, label: value, flag: 0 };
    if (seen === 1) {
      if (value !== SAME && value !== DIFF) return undefined;
      return { seen: 2, label, flag: value };
    }
    if (seen === 2) {
      if ((value !== label) !== (flag === DIFF)) return undefined;
      return { seen: 3, label: 0, flag: 0 };
    }
    return undefined;
  },
  accept: ({ seen }) => seen === 3,
}, 9);

// Reads one line as [digit, flag, digit, flag, ..., digit]. `seg` is how many
// segments have been closed, i.e. the index of the clue the running total is
// working towards; `sum` is that total, tracked only while the current clue is
// a number, since a dash clue compares against nothing. `digitNext` says which
// kind of cell comes next. Crossing a border closes the current segment, so a
// line is accepted only when its border count is exactly one less than its
// clue count and every numeric clue was met exactly.
const lineScanNFA = (clues) => NFA.encodeSpec({
  startState: { seg: 0, sum: 0, digitNext: true },
  transition({ seg, sum, digitNext }, value) {
    if (digitNext) {
      const target = clues[seg];
      if (target === null) return { seg, sum: 0, digitNext: false };
      const total = sum + value;
      if (total > target) return undefined;
      return { seg, sum: total, digitNext: false };
    }
    if (value === SAME) return { seg, sum, digitNext: true };
    if (value !== DIFF) return undefined;
    const target = clues[seg];
    if (target !== null && sum !== target) return undefined;
    if (seg + 1 === clues.length) return undefined;
    return { seg: seg + 1, sum: 0, digitNext: true };
  },
  accept: ({ seg, sum, digitNext }) => (
    !digitNext && seg === clues.length - 1 &&
    (clues[seg] === null || sum === clues[seg])),
}, 9);

// [c1, flag(c1,c2), c2, ..., flag(c8,c9), c9] for one line.
const interleave = (cells, flags) =>
  cells.flatMap((cell, i) => i === 0 ? [cell] : [flags[i - 1], cell]);

const borderFlags = [
  ...hPairCells.map(cell => [cell, vh.at(cell), graph.step(cell, 0, 1)]),
  ...vPairCells.map(cell => [cell, vv.at(cell), graph.step(cell, 1, 0)]),
].map(([cell, flag, neighbour]) =>
  new NFA(borderFlagNFA, 'Border', cc.at(cell), flag, cc.at(neighbour)));

const rowSums = ROW_CLUES.map((clues, i) => {
  const cells = graph.row(i + 1);
  return new NFA(
    lineScanNFA(clues), `RowSums${i + 1}`,
    ...interleave(cells, vh.at(cells.slice(0, -1))));
});

const columnSums = COLUMN_CLUES.map((clues, i) => {
  const cells = graph.column(i + 1);
  return new NFA(
    lineScanNFA(clues), `ColSums${i + 1}`,
    ...interleave(cells, vv.at(cells.slice(0, -1))));
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  vh.toVar('Right border'),
  vv.toVar('Lower border'),
  ...borderFlags,
  ...rowSums,
  ...columnSums,
];
