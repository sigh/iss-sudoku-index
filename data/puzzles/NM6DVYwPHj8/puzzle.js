// Title: The First No L Sudoku
// Author: Trevor Tao
// Video: https://www.youtube.com/watch?v=NM6DVYwPHj8
// Source: https://app.crackingthecryptic.com/webapp/rnDhMgJ4HH

// Normal sudoku rules apply. A little killer diagonal sums to 40 and its
// digits may repeat (LittleKiller semantics). No L-shaped tetromino (any
// rotation or reflection: a straight run of 3 orthogonally-adjacent cells
// plus one further cell attached at a right angle to either end of the run)
// may hold four consecutive digits, in any order across its 4 cells.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Every L/J-tetromino placement on the 9x9 grid falls into one of 8
// orientation templates (a straight 3-cell arm plus a foot cell attached
// perpendicular to one of the arm's two ends: 2 end choices x 2 foot
// directions x {horizontal, vertical} arm). Within one template, every valid
// start position is a pure translation of every other, so each template is
// one `Replicate` group instead of one NFA per position -- not drawn data,
// so derived here rather than hand-enumerated.
const N = 9;

// One template: `starts` are every valid arm-start {r, c}, in increasing
// (r, c) order so the first is the Replicate origin (least cell index);
// `cellsFromStart(r, c)` gives that placement's 4 absolute cells.
const horizontalTemplate = (endOffset, dr) => {
  const starts = [];
  for (let r = 1; r <= N; r++) {
    if (r + dr < 1 || r + dr > N) continue;
    for (let c = 1; c <= N - 2; c++) starts.push({ r, c });
  }
  const cellsFromStart = (r, c) => [
    makeCellId(r, c), makeCellId(r, c + 1), makeCellId(r, c + 2),
    makeCellId(r + dr, c + endOffset),
  ];
  return { starts, cellsFromStart };
};
const verticalTemplate = (endOffset, dc) => {
  const starts = [];
  for (let r = 1; r <= N - 2; r++) {
    for (let c = 1; c <= N; c++) {
      if (c + dc < 1 || c + dc > N) continue;
      starts.push({ r, c });
    }
  }
  const cellsFromStart = (r, c) => [
    makeCellId(r, c), makeCellId(r + 1, c), makeCellId(r + 2, c),
    makeCellId(r + endOffset, c + dc),
  ];
  return { starts, cellsFromStart };
};
const templates = [
  ...[0, 2].flatMap(endOffset => [-1, 1].map(dr => horizontalTemplate(endOffset, dr))),
  ...[0, 2].flatMap(endOffset => [-1, 1].map(dc => verticalTemplate(endOffset, dc))),
];

// A tetromino's 4 cells hold "four consecutive digits" iff they are 4
// pairwise-distinct values whose max-min span is exactly 3 (the only way 4
// values can occupy a width-4 window). State is the bitmask of digits seen
// (bit v-1 for digit v); accept unless the final mask has exactly 4 bits set
// spanning a width of 3. Only 4 symbols are ever consumed, so the mask stays
// far under the state-compile cap.
const noConsecutiveRunSpec = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << (value - 1)),
  accept: (mask) => {
    let count = 0, lo = -1, hi = -1;
    for (let v = 0; v < 9; v++) {
      if (mask & (1 << v)) {
        count++;
        if (lo === -1) lo = v;
        hi = v;
      }
    }
    return !(count === 4 && hi - lo === 3);
  },
}, 9);

const noLRuns = templates.map(({ starts, cellsFromStart }) => {
  const origin = starts[0];
  const originCell = makeCellId(origin.r, origin.c);
  const template = [new NFA(
    noConsecutiveRunSpec, 'noLRun', ...cellsFromStart(origin.r, origin.c))];
  const targets = starts.map(({ r, c }) => makeCellId(r, c));
  return new Replicate(
    template, Replicate.encodeTargetCells(targets, originCell, graph), originCell);
});

return [
  new Shape('9x9'),

  // Givens: cell values from the payload.
  new Given('R1C3', 3), new Given('R1C7', 4),
  new Given('R2C2', 1), new Given('R2C8', 7),
  new Given('R3C1', 5), new Given('R3C3', 4),
  new Given('R3C7', 3), new Given('R3C9', 6),
  new Given('R5C4', 1), new Given('R5C6', 7),
  new Given('R7C1', 4), new Given('R7C3', 5),
  new Given('R7C7', 6), new Given('R7C9', 3),
  new Given('R8C2', 8), new Given('R8C8', 9),
  new Given('R9C3', 6), new Given('R9C7', 5),

  // Little killer: sum 40 along the drawn down-right diagonal from R1C2.
  LittleKiller.fromCells(40, graph.ray('R1C2', 1, 1), geometry),

  ...noLRuns,
];
