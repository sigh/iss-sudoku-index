// Title: Twisted Magic
// Author: Chris C
// Video: https://www.youtube.com/watch?v=UXNWeJoZbl0
// Source: https://app.crackingthecryptic.com/sudoku/DMdfdnRGDf

// Normal sudoku (standard 3x3 boxes). Killer cages: sum to the top-left
// clue, no repeat within the cage. Three outside clues give the sum along a
// diagonal that runs to the grid edge; each of the three lies entirely
// inside a single box, so box all-different already forbids repeats on it
// (matching the rule's "digits may repeat... if allowed by other rules").
// Nine shaded cells form a "twisted magic square": a 3x3 magic square
// rotated 45 degrees onto the grid as a diamond centred on R5C5. Under that
// rotation the original square's rows/columns become the diamond's 3-cell
// diagonals, and the original square's two main diagonals become the plain
// horizontal/vertical lines through R5C5. All 8 of those lines share one
// (unstated) magic sum, and all 9 shaded cells are pairwise distinct.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  [14, 'R3C5', 'R3C4', 'R4C4'],
  [15, 'R4C6', 'R4C7', 'R5C7'],
  [13, 'R5C3', 'R6C3', 'R6C4'],
  [16, 'R6C6', 'R7C6', 'R7C5'],
  [10, 'R2C1', 'R3C1', 'R3C2'],
  [10, 'R6C1', 'R7C1'],
  [10, 'R8C2', 'R9C2', 'R9C3', 'R8C3'],
  [10, 'R8C4', 'R9C4'],
  [10, 'R9C6', 'R9C7'],
  [10, 'R7C8', 'R8C8', 'R8C7', 'R7C9'],
  [10, 'R5C8', 'R5C9'],
  [10, 'R1C8', 'R1C9'],
  [10, 'R2C9', 'R3C9'],
  [10, 'R1C4', 'R1C5'],
];

// The magic square's "rows", "columns" and two "main diagonals", read off
// the diamond as described above.
const magicLines = [
  ['R5C3', 'R4C4', 'R3C5'],
  ['R6C4', 'R5C5', 'R4C6'],
  ['R7C5', 'R6C6', 'R5C7'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R5C3', 'R5C5', 'R5C7'],
  ['R3C5', 'R5C5', 'R7C5'],
];
const magicCells = [
  'R3C5', 'R4C4', 'R5C3', 'R6C4', 'R5C5', 'R4C6', 'R5C7', 'R6C6', 'R7C5',
];

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R9C9', 6),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  LittleKiller.fromCells(19, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R7C1', 1, 1), geometry),

  new EqualSum(...magicLines),
  new AllDifferent(...magicCells),
];
