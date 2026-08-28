// Title: Playing Ludo
// Author: Svanemamma
// Video: https://www.youtube.com/watch?v=eTQSHc8xbhQ
// Source: https://tinyurl.com/3fktkmpa

// Normal sudoku rules apply. Digits along thermometers increase from the
// bulb. Each corner box holds one thermometer running around its eight
// non-centre cells, direction (which end is the bulb) undetermined -- rule
// text: "This is actually only one thermo in each corner, but you have to
// find out for each of them if it goes clockwise or counterclockwise."
// Four more ordinary thermometers run bulb-first into the centre box.
// Coloured circles (not thermometer bulbs) mark odd digits. Killer cages
// forbid repeats and total to the printed sum. The centre cell (marked with
// an arrow icon) is smaller than each of its four orthogonal neighbours.
//
// The payload also draws a short two-cell stroke directly joining each
// corner ring's own two endpoints (R3C3-R2C3, R3C7-R3C8, R7C9-R8C9,
// R7C1-R7C2). That stroke is the visual closer for the "looks like a
// circle" loop and introduces no cell beyond the ring's own endpoints, so
// per the "actually only one thermo" text it is not encoded as a second,
// independent thermometer.

// Corner ring cells, drawn order (source: geometry helper `thermometer`
// entries #0-#3). Each ring's true direction is unmarked, so it is encoded
// as an Or of the drawn order and its reverse.
const cornerRings = [
  ['R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2'],
];
const cornerThermos = cornerRings.map(path => new Or([
  new Thermo(...path),
  new Thermo(...[...path].reverse()),
]));

// Straight bulb-first thermometers (source: `thermometer` entries #4-#7).
const straightThermos = [
  new Thermo('R8C5', 'R7C5', 'R6C5'),
  new Thermo('R5C8', 'R5C7', 'R5C6'),
  new Thermo('R5C2', 'R5C3', 'R5C4'),
  new Thermo('R2C5', 'R3C5', 'R4C5'),
];

// Killer cages (source: `killercage` entries #0-#3).
const cages = [
  new Cage(16, 'R4C2', 'R5C2', 'R5C3', 'R5C4'),
  new Cage(28, 'R2C5', 'R2C6', 'R3C5', 'R4C5'),
  new Cage(23, 'R5C6', 'R5C7', 'R5C8', 'R6C8'),
  new Cage(18, 'R6C5', 'R7C5', 'R8C4', 'R8C5'),
];

return [
  new Shape('9x9'),
  ...cornerThermos,
  ...straightThermos,
  ...cages,
  // Odd-digit circles (source: `circle` entries). No Odd class exists, so
  // encode as a multi-value Given.
  new Given('R4C9', 1, 3, 5, 7, 9),
  new Given('R4C6', 1, 3, 5, 7, 9),
  new Given('R9C5', 1, 3, 5, 7, 9),
  new Given('R6C3', 1, 3, 5, 7, 9),
  // Centre cell smaller than each orthogonal neighbour (source: `minimum`
  // entry at R5C5). GreaterThan binds adjacent pairs in list order.
  new GreaterThan('R4C5', 'R5C5'),
  new GreaterThan('R6C5', 'R5C5'),
  new GreaterThan('R5C4', 'R5C5'),
  new GreaterThan('R5C6', 'R5C5'),
];
