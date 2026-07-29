// Title: Nontuple Dutch
// Author: Tomato Pie
// Video: https://www.youtube.com/watch?v=Jjoim82Puns
// Source: https://sudokupad.app/Q6HfJRFj4r

// Encode normal Sudoku, the nine orange difference-at-least-4 lines, the
// outside skyscraper clues, the arrow, inequalities, and the grey even square.
// The two further orange-line types named but not identified in the rules are
// omitted.
const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = indices.map(row => indices.map(col => makeCellId(row, col)));
const geometry = cellGraph('9x9').gridGeometry();

// Each full-row orange stroke in the drawing supplies one Whisper line.
const orangeLines = rows.map(cells => new Whisper(4, ...cells));

// The R2/R3 labels are the drawn left and right skyscraper clues.
const skyscrapers = [
  Skyscraper.fromCells(3, rows[1], geometry),
  Skyscraper.fromCells(3, rows[1].slice().reverse(), geometry),
  Skyscraper.fromCells(2, rows[2], geometry),
  Skyscraper.fromCells(2, rows[2].slice().reverse(), geometry),
];

return [
  new Shape('9x9'),
  ...orangeLines,
  ...skyscrapers,
  // A >1 skyscraper clue excludes only a leading 9 in its full Sudoku row.
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8),
  new Given('R1C9', 1, 2, 3, 4, 5, 6, 7, 8),
  // The grey arrow drawing has circle R6C6 and arm R5C5-R4C4.
  new Arrow('R6C6', 'R5C5', 'R4C4'),
  // The three drawn inequality symbols point toward the smaller digit.
  new GreaterThan('R8C9', 'R7C9'),
  new GreaterThan('R8C9', 'R9C9'),
  new GreaterThan('R9C9', 'R9C8'),
  // The drawn grey square is an even-digit restriction.
  new Given('R8C9', 2, 4, 6, 8),
];
