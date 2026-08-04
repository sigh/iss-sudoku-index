// Title: Can Of Worms
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=NxFQ8ftK2yI
// Source: https://app.crackingthecryptic.com/sudoku/G7QHB4G3M9

// Normal sudoku rules apply (standard 3x3 boxes). Along each thermometer,
// digits strictly increase starting at the bulb end -- Thermo(...) enforces
// this directly, with the first argument as the bulb.
//
// Ten thermometers, each drawn as a straight diagonal line of cells with a
// filled circle underlay on its bulb (first) cell; the underlay position
// matches the first cell listed for every line, confirming the bulb end.
const thermos = [
  new Thermo('R2C1', 'R1C2'),
  new Thermo('R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Thermo('R6C1', 'R5C2', 'R4C3', 'R3C4'),
  new Thermo('R8C1', 'R7C2', 'R6C3', 'R5C4'),
  new Thermo('R8C3', 'R7C4'),
  new Thermo('R8C7', 'R7C6'),
  new Thermo('R8C9', 'R7C8', 'R6C7', 'R5C6'),
  new Thermo('R6C9', 'R5C8', 'R4C7', 'R3C6'),
  new Thermo('R4C9', 'R3C8', 'R2C7', 'R1C6'),
  new Thermo('R2C9', 'R1C8'),
];

// Givens, from the drawn cells.
const givens = [
  new Given('R3C5', 4),
  new Given('R4C5', 2),
  new Given('R6C1', 4),
  new Given('R6C9', 3),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
