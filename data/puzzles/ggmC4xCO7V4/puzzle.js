// Title: Summer Whispers
// Author: VivaWolf
// Video: https://www.youtube.com/watch?v=ggmC4xCO7V4
// Source: https://app.crackingthecryptic.com/sudoku/drfJJ3M8rM

// Normal sudoku rules apply. Green lines are whisper lines: Whisper(5).
// Grey lines: Whisper(1) -- every drawn grey edge already sits inside one
// shared row, column or box, so this adds nothing beyond default sudoku, but
// is still encoded since the rule names grey lines generally.
// The outside "13" clue is a diagonal total (LittleKiller). It is drawn above
// C3, but its arrow shaft is a 45-degree ray holding row+col constant; walking
// that invariant from the badge lands the diagonal one column to the left of
// the badge, at R1C2-R2C1 (2 cells before running off the grid), not the
// column under the badge. LittleKiller.fromCells locates the canonical corner
// from those cells directly, sidestepping the badge's own lane.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Green whisper lines, one array per drawn stroke. Short 2-cell strokes that
// duplicate an edge already covered by a longer stroke here are omitted.
const whispers = [
  ['R9C2', 'R8C3', 'R9C4', 'R9C5', 'R8C4', 'R8C5', 'R8C6'],
  ['R9C8', 'R8C7', 'R9C6', 'R9C5', 'R8C6'],
  ['R9C9', 'R9C8'],
  ['R9C1', 'R8C2', 'R7C2', 'R6C1', 'R6C2', 'R7C3', 'R7C4', 'R6C5'],
  ['R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R5C8', 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R6C5'],
  ['R4C4', 'R3C3', 'R2C3', 'R1C4', 'R2C5', 'R1C6', 'R2C7', 'R3C7', 'R4C6', 'R5C5'],
  ['R2C1', 'R1C2'],
];

// Grey minimum-difference lines, each a standalone 2-cell edge.
const greys = [
  ['R8C8', 'R9C9'],
  ['R5C8', 'R4C9'],
  ['R9C2', 'R9C1'],
  ['R4C4', 'R5C5'],
];

return [
  new Shape('9x9'),

  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...greys.map(cells => new Whisper(1, ...cells)),

  LittleKiller.fromCells(13, graph.ray('R1C2', 1, -1), geometry),
];
