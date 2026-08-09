// Title: Squid
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=E5t1OXFnhtk
// Source: https://app.crackingthecryptic.com/sudoku/fQLnmjdF6T

// Normal sudoku rules apply (default row/column/box constraints).
// Along thermometers, digits must increase from the bulb end -- `Thermo`
// takes the bulb cell first, then the arm in increasing order.
// Digits along an arrow sum to the number in the circle -- `Arrow` takes the
// bulb/control cell first, followed by the arm cells. Several arrows share a
// bulb cell (R8C7 has three, R8C3 has two); each arrow independently sums to
// that shared bulb digit, so each is encoded as its own `Arrow`.

// Thermometer geometry (grey filled bulb circle, then the line), from the
// `lines` array in the source payload.
const thermos = [
  ['R1C5', 'R2C6', 'R3C7'],
  ['R6C9', 'R5C8', 'R4C7', 'R3C6'],
];

// Arrow geometry (white bulb circle, then the arm), from the `arrows` array
// in the source payload. Grouped by shared bulb cell.
const arrows = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8'],
  ['R8C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3'],
  ['R8C7', 'R9C6'],
  ['R8C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R8C5', 'R7C4', 'R6C3', 'R5C2'],
  ['R8C3', 'R7C2', 'R6C1'],
  ['R8C3', 'R9C2', 'R9C1', 'R8C1'],
];

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...arrows.map((cells) => new Arrow(...cells)),
];
