// Title: Merry X/V-mas
// Author: olima
// Video: https://www.youtube.com/watch?v=VL6qPIWAmBs
// Source: https://sudokupad.app/gtbtt6llob

// Green lines are German whisper lines (adjacent digits differ by at least
// 5); Whisper defaults to difference 5 when the first argument is a cell.
// Line D revisits R5C7 -- the drawn stroke bends back on itself -- so it is
// passed as a 6-cell path with a repeated middle cell; Whisper only binds
// consecutive pairs, so this still constrains exactly the 5 drawn segments
// (R5C7 ends up whisper-adjacent to R6C7, R6C6, and R4C6).
//
// "No two cells sharing an edge sum to 5 or 10" is a global, unscoped
// negative XV rule with zero visible X/V marks anywhere in the grid:
// StrictXV alone (no X/V constraints present) enforces sum != 5, 10 on
// every orthogonally adjacent pair.

const whispers = [
  new Whisper('R1C1', 'R2C2', 'R3C3'),
  new Whisper('R3C1', 'R2C2', 'R1C3'),
  new Whisper('R6C2', 'R5C2', 'R4C2', 'R5C3', 'R4C4', 'R5C4', 'R6C4'),
  new Whisper('R6C7', 'R5C7', 'R6C6', 'R5C5', 'R4C6', 'R5C7'),
  new Whisper('R6C9', 'R6C8', 'R7C8', 'R8C9', 'R9C8', 'R8C7'),
  new Whisper('R1C5', 'R2C6', 'R3C7', 'R2C7', 'R1C8'),
];

return [
  new Shape('9x9'),
  new StrictXV(),
  ...whispers,
];
