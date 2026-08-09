// Title: Pieces
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=gkD2veBbeC8
// Source: https://app.crackingthecryptic.com/sudoku/3r8FmBhLH2

// 8x8 grid, digit range widened to 1-9 (Shape('8x8', 9)): rows/columns stay
// all-different at size 8 out of 9 possible digits. The default 8x8 box
// tiling is 2x4 and is not a rule of this puzzle (only the 2x2 "piece"
// regions and the row/column rule are stated) -- NoBoxes removes it.
//
// A thick wall between columns 4/5 and rows 4/5 (decorative only, no
// separate constraint) splits the board into four 4x4 "grids". Each must use
// exactly 4 of the 9 digits across all 16 cells: a Var pinned to 4 plus
// CountDistinct over the quadrant's cells expresses that cardinality
// directly, since ISS has no simpler "region has exactly K distinct values"
// primitive.
//
// The eight 2x2 "piece" regions (title of the puzzle) carry the no-repeat
// rule; they are two per quadrant and do not tile the remaining two 2x2
// sub-blocks of each quadrant, which are not separately constrained.
//
// Purple lines are Renban (consecutive, non-repeating, any order). Green
// lines are Whisper(5) (neighbours differ by >= 5). Arrows sum to their
// circle. Cages sum to their corner total, no repeats.

const quadrants = [
  [1, 1], // top-left
  [1, 5], // top-right
  [5, 1], // bottom-left
  [5, 5], // bottom-right
];

function quadrantCells(rowStart, colStart) {
  const cells = [];
  for (let dr = 0; dr < 4; dr++) {
    for (let dc = 0; dc < 4; dc++) {
      cells.push(makeCellId(rowStart + dr, colStart + dc));
    }
  }
  return cells;
}

const QUADRANT_LETTERS = ['A', 'B', 'C', 'D'];
const quadrantCounts = quadrants.map(([r, c], i) => {
  const letter = QUADRANT_LETTERS[i];
  const control = new Var('Q' + letter, 'quadrant ' + letter + ' distinct-digit count', 1);
  return [
    control,
    new Given(control.cell(1), 4),
    new CountDistinct(control.cell(1), ...quadrantCells(r, c)),
  ];
});

// Provenance: the 2x2 "piece" no-repeat regions, transcribed from the drawn
// shaded regions (two per quadrant). Other shaded regions cover each
// quadrant-half behind the decorative wall and are not a rule.
const pieces = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
];

// Purple renban lines, transcribed from the drawn line paths.
const renbans = [
  ['R2C1', 'R3C2', 'R4C3'],
  ['R3C3', 'R2C4'],
  ['R1C4', 'R1C5'],
];

// Green whisper lines (min difference 5), transcribed from the drawn line
// paths; paths are open, not closed loops.
const whispers = [
  ['R5C1', 'R6C1', 'R6C2', 'R5C2'],
  ['R8C1', 'R7C2', 'R7C3', 'R8C3'],
  ['R8C4', 'R8C5'],
];

// Arrows: circle cell first, then the line cells, transcribed from the
// drawn arrow paths paired with the circle underlay at each bulb.
const arrows = [
  ['R4C5', 'R5C5', 'R6C4'],
  ['R2C6', 'R3C6', 'R4C7'],
  ['R3C7', 'R2C7', 'R1C7', 'R1C8'],
];

// Cages, transcribed from the drawn cage outlines.
const cages = [
  [24, 'R7C6', 'R7C7', 'R6C7', 'R8C7'],
  [12, 'R6C8', 'R7C8'],
];

return [
  new Shape('8x8', 9),
  new NoBoxes(),
  new Given('R4C1', 8),
  ...quadrantCounts.flat(),
  ...pieces.map(cells => new AllDifferent(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
