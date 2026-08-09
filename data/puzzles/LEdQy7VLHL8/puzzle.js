// Title: All the Indices
// Author: Xykruzine
// Video: https://www.youtube.com/watch?v=LEdQy7VLHL8
// Source: https://app.crackingthecryptic.com/sudoku/gjnpJGb94g

// Normal sudoku rules apply.
// "Any digit appearing in the nth column of a row indicates the column
// where n appears in that row": if cell (R,C) has value V, cell (R,V) has
// value C. This is column indexing (Indexing below), applied to every cell
// -- the rule text names no scope, unlike puzzles that restrict it to
// marked cells.
// Thermometers: digits increase from the bulb (Thermo below).

return [
  new Shape('9x9'),

  // Indexing('C', ...cells) applies once per listed cell: for control cell
  // (R,C) holding value V, it forces cell (R,V) to hold C. Passing every grid
  // cell scopes the rule to the whole grid, as the unrestricted rules text
  // requires.
  new Indexing('C', ...cellGraph('9x9').rows().flat()),

  // Thermometers (grey lines with a filled bulb circle at one end), from the
  // source `lines` array; each line's first cell carries the circle overlay
  // marking the bulb.
  new Thermo('R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  new Thermo('R6C2', 'R6C3', 'R5C3', 'R5C2', 'R5C1', 'R4C1', 'R4C2'),
  new Thermo('R9C1', 'R9C2', 'R8C2', 'R7C2', 'R7C3'),
  new Thermo('R7C4', 'R7C5'),
  new Thermo('R8C6', 'R8C5'),
  new Thermo('R7C9', 'R7C8'),
  new Thermo('R5C9', 'R5C8'),
  new Thermo('R4C6', 'R4C5'),
  new Thermo('R6C6', 'R6C5'),
  new Thermo('R3C9', 'R3C8', 'R3C7', 'R2C7', 'R2C8'),
];
