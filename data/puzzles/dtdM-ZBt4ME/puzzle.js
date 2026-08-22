// Title: Bankshot
// Author: Sotek
// Video: https://www.youtube.com/watch?v=dtdM-ZBt4ME
// Source: https://app.crackingthecryptic.com/sudoku/HBfmTF8rTp

// Normal sudoku (standard 3x3 boxes, drawn regions match the default so no
// override is needed). Cages: Cage(sum, ...cells) with sum given in the
// cage's top-left cell. Arrows: Arrow(bulb, ...arm) with arm digits summing
// to the bulb; two bulb cells each anchor two separate arrows sharing one
// circle, per the drawn geometry. White dot: WhiteDot requires the pair
// consecutive. The rules state "Not all dots are shown", so absence
// elsewhere carries no meaning -- only the one drawn dot is encoded, with
// no StrictKropki-style exhaustive negative.

const cages = [
  new Cage(22, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(11, 'R1C5', 'R1C6', 'R1C7'),
  new Cage(16, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(20, 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Cage(21, 'R6C6', 'R7C6', 'R8C6'),
  new Cage(11, 'R6C5', 'R7C5'),
  new Cage(28, 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),
];

const arrows = [
  new Arrow('R1C8', 'R2C9', 'R3C9'),
  new Arrow('R4C7', 'R3C7', 'R2C8'),
  new Arrow('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Arrow('R5C2', 'R4C1', 'R3C1', 'R2C1'),
  new Arrow('R5C2', 'R6C3', 'R6C4'),
  new Arrow('R7C2', 'R6C1', 'R5C1'),
  new Arrow('R7C2', 'R8C3', 'R8C4', 'R8C5'),
  new Arrow('R8C7', 'R7C8', 'R6C8'),
  new Arrow('R8C9', 'R9C8', 'R9C7'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  new WhiteDot('R1C1', 'R1C2'),
];
