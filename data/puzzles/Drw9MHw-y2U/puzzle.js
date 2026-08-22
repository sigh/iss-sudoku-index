// Title: Hidden under the Rainbow
// Author: Joey Thamir
// Video: https://www.youtube.com/watch?v=Drw9MHw-y2U
// Source: https://app.crackingthecryptic.com/sudoku/j4t8fTBL3F
//
// Each of nine colours stands for one fixed, unknown digit 1-9: every cell
// drawn in a given colour holds that colour's digit, and different colours
// hold different digits. Grey is used twice, told apart by shape (a filled
// square vs a filled circle), matching the rules' note that the grey circle
// is a 9th colour distinct from the grey square.
//
// Encoded per colour group as one cell per equal set (SameValues(cells.length,
// ...cells) forces every listed cell equal), plus one AllDifferent over a
// representative cell from each group so the nine colours take nine distinct
// values.

const colourGroups = [
  ['R1C7', 'R3C6', 'R4C4', 'R6C1', 'R9C9'], // black squares
  ['R2C1', 'R4C8', 'R5C3', 'R7C4', 'R6C6'], // red squares
  ['R1C1', 'R3C9', 'R4C7', 'R9C3'],         // gold squares
  ['R3C4', 'R6C2', 'R7C6', 'R4C9'],         // grey circles (the 9th colour)
  ['R1C5', 'R2C2', 'R7C7'],                 // blue squares
  ['R3C3', 'R8C9', 'R7C1'],                 // yellowgreen squares
  ['R3C7', 'R7C3', 'R8C8'],                 // brown squares
  ['R5C7', 'R9C5', 'R6C3'],                 // purple squares
  ['R3C2'],                                 // grey square (single cell)
];

const sameColourGroups = colourGroups
  .filter((cells) => cells.length >= 2)
  .map((cells) => new SameValues(cells.length, ...cells));

const distinctColours = new AllDifferent(
  ...colourGroups.map((cells) => cells[0])
);

return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R1C8', 3),
  new Given('R4C1', 4),
  new Given('R6C4', 5),
  new Given('R7C8', 9),
  new Given('R8C5', 8),
  new Given('R9C2', 7),
  ...sameColourGroups,
  distinctColours,
];
