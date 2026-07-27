// Title: X marks the Sum
// Author: randall
// Video: https://www.youtube.com/watch?v=DjqVwTTzVvU
// Source: https://sudokupad.app/ehliu8yyko

// Normal sudoku rules apply (rows, columns, 3x3 boxes).
//
// German Whispers (green lines): adjacent digits along a line differ by >= 5.
// Every drawn line leaves the 9x9 play area at one or more bends before
// re-entering it; each such excursion breaks contact with a real digit cell,
// so "adjacent along the line" only holds within each maximal run of
// interior cells between excursions. Each run below is its own whisper, in
// drawn order.
//
// Kropki dots: white = consecutive, black = one digit double the other. Of
// the 8 dot marks drawn in the source, only these 2 sit between two cells
// that are both inside the play grid; the rest touch the outer (non-digit)
// ring and are decoration.
//
// The rules also describe X-Sum clues along the outer ring, but no clue
// value for any of them (given digit, cage total, or overlay text) appears
// anywhere in the source payload. That rule is omitted.

const whispers = [
  ['R2C5', 'R1C5'],
  ['R1C4', 'R2C4', 'R1C3', 'R1C2'],
  ['R2C1', 'R3C2'],
  ['R7C9', 'R8C9'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R8C1', 'R7C2'],
  ['R8C8', 'R7C7'],
];

return [
  new Shape('9x9'),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  new BlackDot('R8C1', 'R9C1'),
  new BlackDot('R7C5', 'R7C6'),
];
