// Title: Arrow Circles
// Author: Sayori
// Video: https://www.youtube.com/watch?v=lxsjYin_tkE
// Source: https://app.crackingthecryptic.com/sudoku/Tpg4Php3p9

// Normal sudoku rules (default 3x3 boxes). Each cage's digits are distinct
// and sum to its printed total (Cage). Each arrow's arm digits sum to the
// digit in its bulb cell (Arrow: bulb cell first, then arm cells). Each
// outside clue gives the sum of the arrow-bulb cells that lie in its
// row/column (Sum over the specific bulb cells identified below) -- this is
// not a directional-scan outside clue, so it is encoded directly rather than
// with a named outside-clue class.
//
// Arrow bulbs and their row/column membership (from the drawn geometry):
//   R1C9 (row1,col9)  R4C9 (row4,col9)  R8C9 (row8,col9)  R8C1 (row8,col1)
//   R4C1 (row4,col1)  R2C1 (row2,col1)  R1C6 (row1,col6)  R3C3 (row3,col3)
//   R4C6 (row4,col6)  R6C3 (row6,col3)
// Row 1 clue (15) sees R1C9, R1C6. Row 4 clue (22) sees R4C9, R4C1, R4C6.
// Row 8 clue (12) sees R8C9, R8C1. Column 1 clue (17) sees R4C1, R2C1, R8C1.
// Column 3 clue (10) sees R3C3, R6C3. (R4C1 and R8C1 each fall in both a row
// clue and a column clue and are counted in both sums.)

const cages = [
  new Cage(10, 'R5C8', 'R5C9'),
  new Cage(6, 'R9C5', 'R9C4'),
];

const arrows = [
  new Arrow('R1C9', 'R2C8', 'R3C8'),
  new Arrow('R4C9', 'R5C9', 'R6C9'),
  new Arrow('R8C9', 'R8C8', 'R8C7'),
  new Arrow('R8C1', 'R8C2', 'R8C3'),
  new Arrow('R4C1', 'R5C1', 'R6C1'),
  new Arrow('R2C1', 'R1C2', 'R1C3'),
  new Arrow('R1C6', 'R2C7', 'R3C7'),
  new Arrow('R3C3', 'R3C4', 'R3C5', 'R2C5'),
  new Arrow('R4C6', 'R5C5', 'R5C4'),
  new Arrow('R6C3', 'R7C4', 'R6C5'),
];

const outsideClues = [
  new Sum(15, 'R1C9', 'R1C6'),
  new Sum(22, 'R4C9', 'R4C1', 'R4C6'),
  new Sum(12, 'R8C9', 'R8C1'),
  new Sum(17, 'R4C1', 'R2C1', 'R8C1'),
  new Sum(10, 'R3C3', 'R6C3'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...outsideClues,
];
