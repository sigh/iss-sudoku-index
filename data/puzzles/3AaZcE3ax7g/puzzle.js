// Title: Cluedoku
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=3AaZcE3ax7g
// Source: https://app.crackingthecryptic.com/webapp/jh6RDHdBmq

// Standard 9x9 sudoku (rows, columns, boxes). Six single-room thermometers,
// one central thermometer with a "broken" cell exempt from its ordering, a
// same-digit-set rule between the six room-centre cells and the six
// coloured centre-box cells, and a rule pinning the broken cell's digit to
// exactly one room thermometer's maximum digit.

const roomThermos = [
  ['R3C2', 'R2C1'],
  ['R3C4', 'R2C4', 'R3C5', 'R3C6', 'R2C6', 'R1C5'],
  ['R1C7', 'R1C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'],
  ['R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2'],
  ['R9C6', 'R9C5'],
  ['R9C8', 'R9C9'],
];

// The central thermometer's bulb-to-tip path, with the broken cell R5C5
// left out of the sequence: "the thermo functions without that digit" means
// the remaining eight cells are strictly increasing on their own, so R5C4
// is directly linked to R5C6. R5C5 carries no ordering constraint at all.
const centralThermoWithoutBrokenCell = [
  'R6C1', 'R5C2', 'R5C3', 'R5C4', 'R5C6', 'R5C7', 'R5C8', 'R4C9',
];

const roomCentreCells = ['R2C2', 'R2C5', 'R2C8', 'R8C2', 'R8C5', 'R8C8'];
const suspectCells = ['R4C4', 'R4C5', 'R4C6', 'R6C4', 'R6C5', 'R6C6'];

// Each room thermo's highest digit is its last (tip) cell, since Thermo
// enforces strict increase from the bulb through the whole listed sequence.
const roomMaxCells = roomThermos.map(cells => cells[cells.length - 1]);
const brokenCell = 'R5C5';

const eqKey = Pair.fnToKey((a, b) => a === b, 9);
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);

// "equal to the highest digit of exactly one of the other six thermos":
// disjoin over which single room max matches the broken cell, requiring
// every other room max to differ from it in that branch.
const brokenCellMatchesExactlyOneRoom = new Or(
  roomMaxCells.map((matchCell, i) => new And([
    new Pair(eqKey, 'brokenMatch', brokenCell, matchCell),
    ...roomMaxCells
      .filter((_, j) => j !== i)
      .map(otherCell => new Pair(neqKey, 'brokenMatch', brokenCell, otherCell)),
  ]))
);

return [
  new Shape('9x9'),
  ...roomThermos.map(cells => new Thermo(...cells)),
  new Thermo(...centralThermoWithoutBrokenCell),
  // "The center squares of the upper and lower 3x3 boxes contain all of the
  // digits in the coloured squares of the central 3x3 box": the two
  // six-cell sets hold the same digits.
  new SameValues(2, ...roomCentreCells, ...suspectCells),
  brokenCellMatchesExactlyOneRoom,
];
