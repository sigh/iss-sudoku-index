// Title: Look, Don't Kill
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=I7atuVv5DAQ
// Source: https://app.crackingthecryptic.com/sudoku/782JMppRnf

// Normal sudoku rules apply (standard rows/columns/boxes, from the default
// Shape('9x9')).
// Along thermometers, digits increase strictly from the bulb end.
// Digits along an arrow sum to the digit in that arrow's circle cell.
// Each cage is either a killer cage (digits distinct, sum to the corner
// clue) or a look-and-say cage (digits can repeat; the corner clue, read as
// (count, value) digit pairs, states an exact count for each named value,
// leaving unnamed values unrestricted) -- or satisfies both readings at
// once. Which reading applies to which cage is not given, so every cage is
// encoded as Or(killer reading, look-and-say reading) and left to the
// solver, per "It is up to the solver to determine which cage is which."

// Thermometers: bulb (filled grey circle) listed first.
// Provenance: the drawn thermometer lines, each paired with a filled grey
// circle marking its bulb end.
const thermos = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R9C4', 'R9C5', 'R8C5'],
  ['R9C7', 'R8C7'],
  ['R7C1', 'R7C2', 'R7C3'],
];

// Arrows: circle cell (white-fill circle, holds the sum) listed first,
// followed by the arm cells in path order.
// Provenance: the drawn arrow paths, each paired with a white circle
// marking its circle cell.
const arrows = [
  ['R4C9', 'R3C9', 'R3C8', 'R3C7', 'R4C7'],
  ['R1C8', 'R1C7', 'R2C7', 'R2C6'],
  ['R3C4', 'R2C4', 'R2C3', 'R3C3', 'R4C3'],
  ['R6C7', 'R6C6', 'R6C5', 'R6C4'],
  ['R8C4', 'R8C3', 'R8C2', 'R8C1'],
];

// Cages: [corner clue, ...cells]. Provenance: the drawn cage outlines and
// their corner clues.
const cages = [
  [19, 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  [16, 'R2C7', 'R1C7', 'R1C8'],
  [18, 'R3C7', 'R3C8', 'R2C8', 'R2C9', 'R3C9'],
  [19, 'R5C7', 'R6C7', 'R6C8', 'R5C8'],
  [14, 'R6C9', 'R7C9', 'R8C9', 'R8C8'],
  [15, 'R7C5', 'R8C5', 'R8C6'],
  [26, 'R6C1', 'R7C1', 'R7C2', 'R6C2'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([value, ...cells]) => new Or([
    new Cage(value, ...cells),
    new LookAndSay(value, ...cells),
  ])),
];
