// Title: July 16, 2023: Speed-Up Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=Wwm1MZqLneE
// Source: https://tinyurl.com/4s52f9t2

// Normal sudoku. Along each thermometer, digits strictly increase from the
// round bulb (first cell listed), and each successive consecutive-pair
// difference (counting from the bulb) is strictly greater than the previous
// one.

const GIVENS = [
  ['R2C2', 1], ['R2C3', 4], ['R2C5', 2], ['R2C6', 5], ['R2C8', 3], ['R2C9', 6],
  ['R5C1', 2], ['R5C2', 7], ['R5C4', 3], ['R5C5', 8], ['R5C7', 1], ['R5C8', 9],
  ['R7C1', 5], ['R7C4', 6], ['R7C7', 4],
  ['R8C2', 6], ['R8C3', 1], ['R8C5', 7], ['R8C6', 3], ['R8C8', 8], ['R8C9', 9],
];

// Thermometers, bulb (first cell) to tip; three of them (R2C3.., R2C6..,
// R2C9..) run diagonally, per the payload's coordinates.
const THERMOS = [
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R5C1', 'R6C2', 'R5C3'],
  ['R5C4', 'R6C5', 'R5C6'],
  ['R5C7', 'R6C8', 'R5C9'],
  ['R2C3', 'R1C2', 'R2C1'],
  ['R2C6', 'R1C5', 'R2C4'],
  ['R2C9', 'R1C8', 'R2C7'],
  ['R8C1', 'R7C1', 'R6C1'],
  ['R8C4', 'R7C4', 'R6C4'],
  ['R8C7', 'R7C7', 'R6C7'],
];

// State: {prev, diff}. `prev` is the previous cell's digit (null before the
// bulb is read); `diff` is the most recent consecutive-pair difference
// (null until two cells have been read). Each new cell must exceed `prev`,
// and once a `diff` exists the new pair's difference must exceed it.
const speedUpThermoSpec = {
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    if (value <= prev) return undefined;
    const d = value - prev;
    if (diff !== null && d <= diff) return undefined;
    return { prev: value, diff: d };
  },
  accept: () => true,
};
const speedUpThermoNFA = NFA.encodeSpec(speedUpThermoSpec, 9);

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...THERMOS.map((cells) => new NFA(speedUpThermoNFA, 'speed-up thermo', ...cells)),
];
