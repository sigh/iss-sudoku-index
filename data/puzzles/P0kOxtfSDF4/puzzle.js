// Title: Too Much...
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=P0kOxtfSDF4
// Source: https://tinyurl.com/nstvvkjc

// Normal sudoku, no negative constraints, no givens. Each of the nine 3x3
// boxes carries its own independent rule instead of one variant applying to
// the whole grid: Box1 between line, Box2 arrows, Box3 killer cages, Box4
// quadruples, Box5 magic square, Box6 black-dot ratios, Box7 XV, Box8 a
// local-minimum cell, Box9 little killer sums.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Box 1: "Digits on the line are between the digits in the circles." The
  // drawn between-line's first and last cells (R3C3, R2C3) are the circled
  // ends; the six interior cells lie strictly between them.
  new Between('R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2', 'R2C3'),

  // Box 2: "Digits on an arrow sum to the number in the circle." Bulb cell
  // first, then the arm cells, per the drawn arrow paths.
  new Arrow('R2C4', 'R2C5', 'R3C5'),
  new Arrow('R3C6', 'R2C6', 'R1C5'),

  // Box 3: "Digits in a cage sum to the given clue."
  new Cage(24, 'R1C7', 'R2C7', 'R2C8', 'R3C8'),
  new Cage(9, 'R1C9', 'R2C9', 'R3C9'),

  // Box 4: "A digit in a circle must appear in one of the four surrounding
  // cells." Each listed value must appear somewhere in its 2x2, anchored at
  // its top-left cell.
  new Quad('R4C2', 2, 3, 5),
  new Quad('R5C2', 1, 8, 9),

  // Box 5: "Box 5 is a magic square, with each row, column and 3-cell
  // diagonal having the same sum." No drawn clue -- the rule text is the
  // clue. Box5's own all-different (from the default box constraint) forces
  // the common sum to 15; EqualSum states the "same sum" requirement itself.
  new EqualSum(
    ['R4C4', 'R4C5', 'R4C6'], ['R5C4', 'R5C5', 'R5C6'], ['R6C4', 'R6C5', 'R6C6'],
    ['R4C4', 'R5C4', 'R6C4'], ['R4C5', 'R5C5', 'R6C5'], ['R4C6', 'R5C6', 'R6C6'],
    ['R4C4', 'R5C5', 'R6C6'], ['R4C6', 'R5C5', 'R6C4'],
  ),

  // Box 6: "Two cells joined by a black dot have a 1:2 ratio."
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R5C9', 'R4C9'),
  new BlackDot('R4C7', 'R5C7'),

  // Box 7: "Digits joined by a V or X sum to 5 or 10 respectively." No
  // negative constraint declared (ruleset: "no negative constraints"), so
  // unmarked adjacent pairs are left unrestricted.
  new X('R9C1', 'R8C1'),
  new X('R7C1', 'R7C2'),
  new X('R8C3', 'R8C2'),
  new V('R7C2', 'R7C3'),

  // Box 8: "The digit in the marked cell is less than its orthogonal
  // neighbours." R8C5 is the box's centre; all four orthogonal neighbours
  // are on-grid. GreaterThan(...cells) only relates cells adjacent in the
  // grid regardless of list position, so one call with R8C5 last checks
  // each neighbour > R8C5 and nothing else (no two neighbours here are
  // mutually adjacent).
  new GreaterThan('R7C5', 'R9C5', 'R8C4', 'R8C6', 'R8C5'),

  // Box 9: "Clues outside the grid show the sum of the indicated diagonals."
  // Diagonals run down-left (dRow=1, dCol=-1) from the on-grid cell
  // diagonally adjacent to each outside marker, to the grid edge.
  LittleKiller.fromCells(7, graph.ray('R8C9', 1, -1), cellGeometry('9x9')),
  LittleKiller.fromCells(21, graph.ray('R7C9', 1, -1), cellGeometry('9x9')),
];
