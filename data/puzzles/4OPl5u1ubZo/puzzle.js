// Title: A (sling)Shot in the Dark
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=4OPl5u1ubZo
// Source: https://app.crackingthecryptic.com/sudoku/GThfJTPqtL
//
// Normal sudoku, standard 3x3 boxes.
//
// Bent-arrow ("slingshot") clues: each origin cell is drawn with a stub (a
// half-cell dash into one adjacent cell, the "reference" cell) and a chevron
// (an arrowhead icon inside the same cell, pointing a second "target"
// direction). The rules' own worked example (R1C4=3 => digit(R2C4) ==
// digit(R1C1)) fixes the reading: digit(origin) tells how many cells out the
// target direction to find a cell that must match the reference cell's
// digit. Encoded below with ValueIndexing(referenceCell, originCell,
// ...targetRayCellsInOrder) -- the control cell (origin) selects the
// 1-indexed ray cell that must equal the value cell (reference).
//
// Two locations replace the ordinary stub+chevron with the rules' explicit
// "double-headed arrow is two overlapping slingshots": R1C3 carries two
// chevrons (east, south) and no stub -- read as two slingshots, each using
// the other's direction as its reference; R3C1/R3C2 are joined by a
// full-cell-length stub (every ordinary stub is only half a cell) and each
// carries its own chevron (both south) -- read as two slingshots, each using
// the other cell as its reference.
//
// Green lines: adjacent digits differ by at least 5 (Whisper). One further
// green-line entry in the payload carries no coordinates at all -- its cells
// cannot be recovered, so it is omitted.

const DIRS = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

// Step from a cell one unit in a direction; returns null if off-grid.
function step(cell, dir) {
  const { row, col } = parseCellId(cell);
  const [dr, dc] = DIRS[dir];
  const r = row + dr, c = col + dc;
  if (r < 1 || r > 9 || c < 1 || c > 9) return null;
  return makeCellId(r, c);
}

// Ray of cells leaving `origin` in `dir`, starting one step away, out to the
// edge of the grid. This is the arrow's target ray; ValueIndexing indexes
// into it 1-based with the origin's own digit.
function ray(origin, dir) {
  const cells = [];
  let cur = origin;
  for (;;) {
    cur = step(cur, dir);
    if (cur === null) break;
    cells.push(cur);
  }
  return cells;
}

// Each entry: [originCell, referenceDirection, targetDirection].
// Transcribed from the drawn stub direction (reference) and chevron
// direction (target) at each origin cell (thickness-2 stubs and thickness-4
// chevrons in the source drawing).
const SLINGSHOTS = [
  // R1C3 double-headed pair (no stub; two chevrons, east + south).
  ['R1C3', 'S', 'E'],
  ['R1C3', 'E', 'S'],
  // Ordinary single-headed slingshots.
  ['R1C4', 'S', 'W'],
  ['R1C5', 'S', 'W'],
  ['R1C6', 'S', 'W'],
  ['R1C8', 'W', 'S'],
  ['R2C2', 'E', 'S'],
  // R3C1/R3C2 double-headed pair (full-cell-length shared stub).
  ['R3C1', 'E', 'S'],
  ['R3C2', 'W', 'S'],
  ['R3C5', 'E', 'S'],
  ['R3C7', 'W', 'N'],
  ['R6C7', 'W', 'S'],
  ['R6C8', 'S', 'W'],
  ['R7C4', 'N', 'E'],
  ['R8C4', 'S', 'E'],
  ['R9C4', 'W', 'N'],
];

const valueIndexers = SLINGSHOTS.map(([origin, refDir, targetDir]) => {
  const reference = step(origin, refDir);
  const targetRay = ray(origin, targetDir);
  return new ValueIndexing(reference, origin, ...targetRay);
});

// Green ("differ by at least 5") lines. Cell paths transcribed from the
// source drawing's yellow-green thickness-11 lines. A fifth same-coloured
// line entry has no waypoints and is omitted.
const whispers = [
  new Whisper(5, 'R2C8', 'R3C8', 'R3C9'),
  new Whisper(5, 'R3C4', 'R4C4', 'R4C3'),
  new Whisper(5, 'R8C2', 'R8C3', 'R9C3'),
  new Whisper(5, 'R6C2', 'R6C1'),
];

return [
  new Shape('9x9'),
  ...valueIndexers,
  ...whispers,
];
