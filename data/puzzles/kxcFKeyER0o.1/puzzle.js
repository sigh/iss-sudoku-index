// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kxcFKeyER0o
// Source: https://cracking-the-cryptic.web.app/sudoku/BjDnndmJF7

// Normal sudoku rules apply. Nine thermometers are drawn. Five are normal (the
// bulb holds the smallest digit, digits increase away from the bulb) and four
// are broken (the bulb holds the biggest digit, digits decrease away from the
// bulb). The rules do not say which are which -- that is the deduction the
// puzzle asks for -- so polarity is carried by a solver-chosen flag per
// thermometer, and only the five/four split is imposed. Two thermometers share
// a bulb at R3C7 and the rules say they need not match in polarity, so those
// two keep independent flags and nothing links them.

// The nine drawn strokes, bulb cell first. Cell paths transcribed from the
// grey thermometer strokes; the bulb end of each is the end carrying the drawn
// red-bordered circle. Two strokes have a circle at both ends (thermometers 5
// and 7 below): the rules name R3C7 as the only shared bulb, so for those two
// the bulb is the end that is not another thermometer's bulb -- R3C1 for
// thermometer 5, and R3C7 for thermometer 7, which is the shared bulb itself.
const THERMOS = [
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R7C7', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C8', 'R8C7'],
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R6C5'],
  ['R4C3', 'R5C3', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R3C1', 'R3C2', 'R2C2'],
  ['R2C2', 'R2C3', 'R1C3', 'R1C4', 'R1C5'],
  ['R3C7', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3'],
  ['R3C7', 'R3C6', 'R2C6'],
  ['R3C8', 'R2C8', 'R1C8', 'R1C9'],
];

const NORMAL_COUNT = 5;

// One flag cell per thermometer, restricted to {1, 2} below: 1 means normal,
// 2 means broken. These are the puzzle's own unknown, not an encoding artifact.
const flags = new Var('M', 'thermometer polarity flags', THERMOS.length);
const flagCells = flags.cells();

return [
  new Shape('9x9'),
  new Given('R9C9', 5),

  flags,
  ...flagCells.map((cell) => new Given(cell, 1, 2)),
  // Exactly five flags read normal; the remaining four can only be 2 (broken),
  // since the flag domain holds nothing else.
  new ContainExact(Array(NORMAL_COUNT).fill(1).join('_'), ...flagCells),

  // A broken thermometer -- biggest at the bulb, decreasing away from it -- is
  // an ordinary thermometer read from its far end back to the bulb, so both
  // polarities are a Thermo over the same cells in one order or the other.
  ...THERMOS.map((cells, i) => new Or([
    new And([
      new Given(flagCells[i], 1),
      new Thermo(...cells),
    ]),
    new And([
      new Given(flagCells[i], 2),
      new Thermo(...[...cells].reverse()),
    ]),
  ])),
];
