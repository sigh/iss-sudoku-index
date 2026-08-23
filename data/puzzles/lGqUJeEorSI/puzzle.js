// Title: 159 Thermo
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=lGqUJeEorSI
// Source: https://app.crackingthecryptic.com/sudoku/8NPmPfpN84

// Normal sudoku rules apply. Along thermometers, digits increase from the
// bulb end. Digits in column 1 indicate the column in which the digit 1
// appears in that row (e.g. if R4C1 is a 6, R4C6 is a 1). The same applies
// to columns 5 and 9 with the digits 5 and 9 respectively.

// Thermometers: bulb (first cell) confirmed by the drawn circle marker at
// each line's first waypoint. Two bulb cells (R2C1, R5C9) each carry two
// separate arms, drawn as two line entries sharing one bulb.
const thermos = [
  new Thermo('R2C1', 'R2C2', 'R2C3', 'R2C4'),
  new Thermo('R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Thermo('R2C9', 'R1C9'),
  new Thermo('R2C7', 'R3C7'),
  new Thermo('R5C9', 'R5C8'),
  new Thermo('R5C9', 'R6C9', 'R7C9'),
  new Thermo('R7C1', 'R7C2', 'R7C3'),
  new Thermo('R6C4', 'R6C5', 'R6C6', 'R6C7'),
  new Thermo('R4C5', 'R4C6', 'R4C7'),
  new Thermo('R9C7', 'R9C6', 'R9C5'),
];

// Column indexing: for a cell R*C1 with value V, the digit 1 in that row
// sits at column V (cell R*CV = 1); the rules' own worked example (R4C1=6
// => R4C6=1) fixes this direction. The same relation applies with target
// digit 5 for column 5 and target digit 9 for column 9. `Indexing('C', ...)`
// derives each control cell's target value from its own column (col+1), so
// passing all cells of columns 1, 5 and 9 together yields exactly the three
// rules in one constraint.
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const col1 = rows.map(r => makeCellId(r, 1));
const col5 = rows.map(r => makeCellId(r, 5));
const col9 = rows.map(r => makeCellId(r, 9));

return [
  new Shape('9x9'),
  ...thermos,
  new Indexing('C', ...col1, ...col5, ...col9),
];
