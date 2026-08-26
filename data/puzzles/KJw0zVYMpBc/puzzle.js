// Title: 3 Bags Full
// Author: Panthera
// Video: https://www.youtube.com/watch?v=KJw0zVYMpBc
// Source: https://tinyurl.com/28k4pfxa

// Irregular sudoku: default boxes removed, replaced by nine drawn jigsaw
// regions (transcribed from the payload's grid.region overrides; cells with
// no override keep their default 3x3 box).
//
// Two-color Japanese sums: every row and column carries a printed clue whose
// space-separated numbers are the sums of the contiguous shaded runs in that
// lane, read from the edge the clue is printed on into the grid (matching the
// payload's anchor cell for each clue: row clues anchor at column 0, column
// clues at row 0). A "black" clue shades its runs black only, a "grey" clue
// (printed in blue text in the source) shades its runs grey only, and a "red"
// clue requires both colors to appear somewhere in that lane without fixing
// which run gets which color. A run is a maximal same-colored block, so
// "an unshaded cell must separate two same-color runs" holds automatically
// and adds no extra constraint; runs of different colors may sit adjacent
// with no gap.
//
// Shading is modeled as an auxiliary Var per cell (1 = unshaded, 2 = black,
// 3 = grey), restricted per lane by a Given, and each lane's run/sum sequence
// is checked by a purpose-built NFA that reads (shade, digit) pairs cell by
// cell and tracks the in-progress run's color/sum plus which target sum is
// next.

const UNSHADED = 1, BLACK = 2, GREY = 3;

const rowClues = [
  { color: 'grey', sums: [16] },
  { color: 'red', sums: [10, 9, 13] },
  { color: 'red', sums: [9, 10] },
  { color: 'red', sums: [7, 34] },
  { color: 'red', sums: [6, 37] },
  { color: 'red', sums: [4, 40] },
  { color: 'grey', sums: [38] },
  { color: 'grey', sums: [17] },
  { color: 'black', sums: [5, 2] },
];

const colClues = [
  { color: 'black', sums: [10] },
  { color: 'red', sums: [7, 12] },
  { color: 'grey', sums: [27] },
  { color: 'red', sums: [23, 5] },
  { color: 'red', sums: [2, 24] },
  { color: 'red', sums: [8, 34, 2] },
  { color: 'grey', sums: [44] },
  { color: 'red', sums: [2, 7, 28] },
  { color: 'red', sums: [6, 16] },
];

// Jigsaw regions, transcribed from grid.region (default box where absent).
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R5C7'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R5C3', 'R6C3', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C6'],
  ['R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R7C8', 'R8C8'],
  ['R7C4', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R2C2', 'R3C2', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
];

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VSH');
const gridCell = (r, c) => makeCellId(r, c); // r, c are 1-indexed
const shadeCell = (r, c) => shade.at(gridCell(r, c));

const allowedFor = (color) => (
  color === 'black' ? [UNSHADED, BLACK] :
  color === 'grey' ? [UNSHADED, GREY] :
  [UNSHADED, BLACK, GREY]
);

const domainGivens = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    domainGivens.push(new Given(shadeCell(r, c), ...allowedFor(rowClues[r - 1].color)));
    domainGivens.push(new Given(shadeCell(r, c), ...allowedFor(colClues[c - 1].color)));
  }
}

// One NFA per lane, scanning [shade1, digit1, shade2, digit2, ...]. `stage`
// toggles which of the pair is being read; `run` holds the color/sum of the
// in-progress shaded run (null when the last cell read was unshaded and no
// run is open); `j` indexes the next target sum still to be satisfied. A
// color change with no gap closes the previous run and opens a new one in
// the same step, since a run is defined as maximal-same-color.
function laneSpec(targets) {
  const cap = Math.max(...targets) + 1;
  return NFA.encodeSpec({
    startState: { stage: 0, color: null, run: null, j: 0 },
    transition: (s, v) => {
      if (s.stage === 0) {
        // The shading Var is domain-restricted to 1/2/3 by a Given, but the
        // compiler still has to see the full 1-9 alphabet at this position;
        // reject out-of-range reads immediately so they die here instead of
        // multiplying the reachable state count.
        if (v > GREY) return undefined;
        return { stage: 1, color: v, run: s.run, j: s.j };
      }
      const color = s.color;
      let { run, j } = s;
      if (color === UNSHADED) {
        if (run) {
          if (run.sum !== targets[j]) return undefined;
          j += 1;
          run = null;
        }
      } else if (run && run.color === color) {
        run = { color, sum: Math.min(run.sum + v, cap) };
      } else {
        if (run) {
          if (run.sum !== targets[j]) return undefined;
          j += 1;
        }
        if (j >= targets.length) return undefined;
        run = { color, sum: Math.min(v, cap) };
      }
      return { stage: 0, color: null, run, j };
    },
    accept: (s) => {
      if (s.stage !== 0) return false;
      if (s.run) return s.j === targets.length - 1 && s.run.sum === targets[s.j];
      return s.j === targets.length;
    },
  }, 9);
}

const laneConstraints = [];
for (let r = 1; r <= 9; r++) {
  const seq = [];
  for (let c = 1; c <= 9; c++) { seq.push(shadeCell(r, c)); seq.push(gridCell(r, c)); }
  laneConstraints.push(new NFA(laneSpec(rowClues[r - 1].sums), `row ${r} sums`, ...seq));
}
for (let c = 1; c <= 9; c++) {
  const seq = [];
  for (let r = 1; r <= 9; r++) { seq.push(shadeCell(r, c)); seq.push(gridCell(r, c)); }
  laneConstraints.push(new NFA(laneSpec(colClues[c - 1].sums), `col ${c} sums`, ...seq));
}

// Red lanes: both colors must appear somewhere in the lane.
const bothColors = [];
for (let r = 1; r <= 9; r++) {
  if (rowClues[r - 1].color !== 'red') continue;
  const cells = Array.from({ length: 9 }, (_, i) => shadeCell(r, i + 1));
  bothColors.push(new ContainAtLeast('2_3', ...cells));
}
for (let c = 1; c <= 9; c++) {
  if (colClues[c - 1].color !== 'red') continue;
  const cells = Array.from({ length: 9 }, (_, i) => shadeCell(i + 1, c));
  bothColors.push(new ContainAtLeast('2_3', ...cells));
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  shade.toVar('shading: 1 unshaded, 2 black, 3 grey'),
  ...domainGivens,
  ...laneConstraints,
  ...bothColors,
];
