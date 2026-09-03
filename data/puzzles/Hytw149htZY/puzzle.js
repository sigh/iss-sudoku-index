// Title: Zodiac Project: Taurus
// Author: ThePedallingPianist & Friends
// Video: https://www.youtube.com/watch?v=Hytw149htZY
// Source: https://sudokupad.app/ksj8nzm463

// Rules encoded here:
//   Sudoku: 1-9 in the bold 9x9 grid, no repeat in a row, column or 3x3 box.
//   Taurus torus: draw 9 straight diagonal lines, each through the centres of at
//     least 3 cells; every line holds exactly one Bull and exactly one Red Flag;
//     different lines do not cross or share cells; the grid is a torus, so row 1
//     wraps to row 9 and column 1 wraps to column 9.
//   Bulls: no two Bulls hold the same digit; a Bull's digit is the mean of all
//     digits on its line.
//   Flags: no two Red Flags hold the same digit; a Red Flag's digit equals its
//     own row, column or box number (boxes numbered 1-9 in reading order).
//
// "Straight diagonal" is read as a 45-degree heading, one step of row per step of
// column: that is the sense the rules' own torus illustration is drawn in, a
// one-cell-deep ring repeating the grid's opposite edge, which shows a wrapping
// line's continuation exactly one row and one column on.

const OFF = 10;                      // overlay value for a cell on no line
const shape = new Shape('9x9', 10);  // widened alphabet: 9 line labels plus OFF
const graph = cellGraph(shape);
const lineOf = graph.makeOverlay('VL');   // per cell: which line covers it, or OFF

// Markers transcribed from the emoji overlays inside the bold frame. The same
// emoji in the surrounding wrap ring are that ring's copies of these cells.
const BULLS = ['R1C1', 'R2C2', 'R3C1', 'R1C9', 'R7C9', 'R9C9', 'R9C2', 'R8C3', 'R1C5'];
const FLAGS = ['R1C3', 'R2C7', 'R2C9', 'R8C7', 'R8C8', 'R6C5', 'R6C4', 'R4C6', 'R8C2'];

// Given digits, from the grid's filled cells.
const givens = [['R1C7', 6], ['R2C5', 4], ['R4C1', 8], ['R6C9', 2]]
  .map(([cell, digit]) => new Given(cell, digit));

// The grid alphabet is widened only to give the overlay its OFF value, so the
// playable cells are restricted back to 1-9.
const digitRange = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- Torus geometry -------------------------------------------------------
const wrap = n => ((n - 1) % 9 + 9) % 9 + 1;
const stepTorus = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  return makeCellId(wrap(row + dRow), wrap(col + dCol));
};

const HEADINGS = [[1, 1], [1, -1]];   // the two 45-degree diagonal directions

// Every straight diagonal run of 3..9 cells that passes through `cell`: both
// headings, and `cell` at each position along the run. Keyed by cell set, so the
// nine rotations of a full 9-cell wrap-around diagonal collapse to one entry.
const segmentsThrough = (cell) => {
  const found = new Map();
  for (const [dRow, dCol] of HEADINGS) {
    for (let len = 3; len <= 9; len++) {
      for (let before = 0; before < len; before++) {
        const start = stepTorus(cell, -before * dRow, -before * dCol);
        const cells = [];
        for (let i = 0; i < len; i++) {
          cells.push(stepTorus(start, i * dRow, i * dCol));
        }
        found.set([...cells].sort().join('_'), cells);
      }
    }
  }
  return [...found.values()];
};

// --- The nine lines -------------------------------------------------------
// Lines and Bulls are in bijection: there are 9 of each, every line holds
// exactly one Bull, and no two lines share a cell. So line i is "the Bull i
// line", and the overlay labels a cell with the index of the line covering it.
//
// The line geometry is the solver's to find, so each line is a disjunction over
// its candidate segments. Candidacy applies exactly the rules that speak about
// one line on its own -- straight, diagonal, at least 3 cells, exactly one Bull,
// exactly one Flag; the rules relating different lines are enforced on the
// overlay below, not by this filter.
const candidates = BULLS.map(bull => segmentsThrough(bull).filter(cells =>
  cells.filter(cell => BULLS.includes(cell)).length === 1 &&
  cells.filter(cell => FLAGS.includes(cell)).length === 1));

// The cells line i could ever cover.
const reach = candidates.map(list => [...new Set(list.flat())]);

// A cell carries the label of the line covering it, or OFF; only a line that can
// reach the cell is a candidate label there. One label per cell is what makes
// the lines share no cells.
const labelDomains = graph.cells().map(cell => new Given(
  lineOf.at(cell),
  ...reach.flatMap((cells, i) => (cells.includes(cell) ? [i + 1] : [])),
  OFF));

// One branch per candidate segment. It labels the segment's cells with this
// line's label, and `ContainExact` fixes how many cells in reach carry that
// label, so no cell outside the segment can also take it. The Bull's mean rule
// is sum(line) = length * Bull, written with the Bull's coefficient folded in.
const lines = candidates.map((list, i) => new Or(list.map(cells => new And([
  ...cells.map(cell => new Given(lineOf.at(cell), i + 1)),
  new ContainExact(
    Array(cells.length).fill(i + 1).join('_'), ...lineOf.at(reach[i])),
  new Sum(0, ...cells.map(
    cell => (cell === BULLS[i] ? [cell, 1 - cells.length] : cell))),
]))));

// --- Lines do not cross ---------------------------------------------------
// Two cells one diagonal step apart lie on a single diagonal cycle, and a line
// is a contiguous run along one cycle, so if both carry the same non-OFF label
// that line runs through the lattice corner between them. Each cell's
// bottom-right corner is shared by one such pair from each heading, and at most
// one of the two may be on a line.
const differentLines = Pair.fnToKey((a, b) => a !== b || a === OFF, shape);
const noCrossings = graph.cells().map(cell => new Or([
  new Pair(differentLines, 'no cross',
    lineOf.at(cell), lineOf.at(stepTorus(cell, 1, 1))),
  new Pair(differentLines, 'no cross',
    lineOf.at(stepTorus(cell, 0, 1)), lineOf.at(stepTorus(cell, 1, 0))),
]));

// --- Flags ----------------------------------------------------------------
const boxNumber = (cell) => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};
const friendlyFlags = FLAGS.map((cell) => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, ...new Set([row, col, boxNumber(cell)]));
});

return [
  shape,
  lineOf.toVar('line'),
  digitRange,
  ...givens,
  new AllDifferent(...BULLS),
  new AllDifferent(...FLAGS),
  ...friendlyFlags,
  ...labelDomains,
  ...lines,
  ...noCrossings,
];
