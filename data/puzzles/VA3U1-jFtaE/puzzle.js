// Title: Pliers
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=VA3U1-jFtaE
// Source: https://app.crackingthecryptic.com/sudoku/6r4hPpFg9m

// Normal sudoku (rows, columns, boxes). 8 thermometers, strictly increasing
// from the bulb. Any two diagonally adjacent cells (sharing only a corner,
// king's-move diagonal) forbid a repeat; orthogonal adjacency is unrestricted
// beyond the normal row/column/box rules. The payload's 9th `lines` entry has
// no way-points and no resolvable cells; it is a degenerate stroke and is
// omitted here.

const graph = cellGraph('9x9');

// Thermometers: bulb cell first, per the coloured lines' wayPoints (bulb end
// carries the matching underlay circle).
const thermometers = [
  ['R3C2', 'R3C3', 'R4C4', 'R4C5'], // A
  ['R4C2', 'R4C3', 'R3C4', 'R3C5'], // B
  ['R3C9', 'R3C8', 'R4C7', 'R4C6'], // C
  ['R4C9', 'R4C8', 'R3C7', 'R3C6'], // D
  ['R6C2', 'R6C3', 'R7C4', 'R7C5'], // E
  ['R7C2', 'R7C3', 'R6C4', 'R6C5'], // F
  ['R6C6', 'R6C7', 'R7C8', 'R7C9'], // G
  ['R7C6', 'R7C7', 'R6C8', 'R6C9'], // H
];

// Diagonal non-repeat: every diagonal edge of the grid is exactly one of the
// two diagonals of exactly one 2x2 block, so a single template over each
// 2x2 block's own two diagonals -- replicated over every top-left origin --
// covers each diagonally-adjacent pair once.
const [blockTL, blockTR, blockBL, blockBR] = graph.block('R1C1', 2, 2);
const diagonalTemplate = [
  new AllDifferent(blockTL, blockBR),
  new AllDifferent(blockTR, blockBL),
];
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2) !== null);
const diagonalNonRepeat = graph.makeReplicate(diagonalTemplate, blockOrigins);

return [
  new Shape('9x9'),
  new Given('R1C1', 2),
  new Given('R1C7', 6),
  new Given('R9C1', 8),
  ...thermometers.map(cells => new Thermo(...cells)),
  diagonalNonRepeat,
];
