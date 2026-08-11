// Title: 4DS
// Author: Bremster
// Video: https://www.youtube.com/watch?v=QWaHLf-NGO0
// Source: https://app.crackingthecryptic.com/sudoku/Jj2Tt9N8f3

// Normal sudoku rules (default 9x9 boxes, matching the payload's own
// regions). Each coloured line holds a complete set of 1-9 (AllDifferent
// over its 9 cells). Each arrow's bulb equals the sum of its two arm cells.
// Each cage sums to its top-left total; every cage lies wholly inside one
// box, so its own no-repeat clause is redundant with the box all-different.
// A white dot marks a consecutive pair: four on ordinary row/column
// adjacency (WhiteDot), two between diagonally adjacent cells on a coloured
// line, encoded with a custom Pair since WhiteDot only binds grid-adjacent
// cells. The blue circle/square cells are odd/even candidate restrictions.

// Coloured lines: each cell list traced from the drawn line's waypoints
// (diagonal segments interpolated at half-integer cell centres).
const lines = [
  ['R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6', 'R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'],
];

// Arrows: bulb first, then arm cells (snapped from the arrow wayPoints;
// each bulb coincides with a plain circle underlay at that cell).
const arrows = [
  ['R5C1', 'R5C2', 'R4C3'],
  ['R1C5', 'R2C5', 'R3C6'],
  ['R5C9', 'R5C8', 'R6C7'],
  ['R9C5', 'R8C5', 'R7C4'],
];

// Cages: [total, ...cells], transcribed from the drawn cage outlines,
// excluding 3 metadata stub entries (title/author/rules text).
const cages = [
  [18, 'R7C2', 'R7C3', 'R8C3'],
  [11, 'R8C7', 'R7C7', 'R7C8'],
  [9, 'R3C2', 'R3C3', 'R2C3'],
  [16, 'R2C7', 'R3C7', 'R3C8'],
  [16, 'R5C4', 'R5C5', 'R5C6'],
  [6, 'R5C7', 'R5C8'],
  [6, 'R5C2', 'R5C3'],
];

// White dots on plain row/column adjacency (edge-rendered overlays).
const whiteDots = [
  ['R5C3', 'R6C3'],
  ['R3C4', 'R3C5'],
  ['R4C7', 'R5C7'],
  ['R7C5', 'R7C6'],
];

// White dots between diagonally adjacent cells on a coloured line
// (corner-rendered overlays); WhiteDot rejects non-grid-adjacent cells, so
// use a custom Pair with the same consecutive predicate.
const lineDots = [
  ['R3C2', 'R2C3'],
  ['R2C7', 'R3C8'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new AllDifferent(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...lineDots.map(cells => new Pair(
    Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9),
    'white dot',
    ...cells)),
  new Given('R5C2', 1, 3, 5, 7, 9),
  new Given('R5C8', 2, 4, 6, 8),
];
