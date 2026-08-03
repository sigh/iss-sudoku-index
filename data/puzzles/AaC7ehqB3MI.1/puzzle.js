// Title: 6/6/23: Double Digit Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=AaC7ehqB3MI
// Source: https://tinyurl.com/atbx72w7

// Normal sudoku rules apply. Along each thermometer, read the digits in order
// from the round bulb as a series of non-overlapping 2-digit numbers (cell
// pair 1&2, then 3&4, ...). That sequence of 2-digit numbers must strictly
// increase along the thermometer (the rules' own worked example -
// 13,17,18,26,29 from 1317182629 - is strictly increasing, so ties are not
// read as satisfying "increase").

const graph = cellGraph('9x9');

// The payload draws each thermometer's stroke as two separate `line` entries
// that share one cell where the drawing was cut around a given digit (R2C3
// and R8C7 are both given cells). Only 4 circles (bulbs) are drawn for 6 line
// entries, and the 2 entries with no bulb of their own (the ones starting
// R2C3 and R9C8) are odd-length fragments (3 cells) that cannot themselves
// carry a "non-overlapping 2-digit numbers" reading. Both facts point the
// same way: each such pair of entries sharing an endpoint is one continuous
// thermometer, joined here into a single ordered cell list bulb-to-tip.
const THERMOMETERS = [
  // Bulb R1C2. Line entries #2 (R1C2-R1C3-R2C3) + #0 (R2C3-...-R7C9), joined
  // at shared cell R2C3.
  ['R1C2', 'R1C3', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R4C6',
   'R5C6', 'R5C7', 'R6C7', 'R6C8', 'R7C8', 'R7C9'],
  // Bulb R3C1. Line entries #1 (R3C1-...-R8C7) + #3 (R9C8-R9C7-R8C7, reversed
  // here to continue away from the bulb), joined at shared cell R8C7.
  ['R3C1', 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4', 'R6C5',
   'R7C5', 'R7C6', 'R8C6', 'R8C7', 'R9C7', 'R9C8'],
  // Bulb R6C1. Line entry #4, a single unsplit stroke.
  ['R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5'],
  // Bulb R1C5. Line entry #5, a single unsplit stroke.
  ['R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9'],
];

// Givens, transcribed from the payload's `grid[].value` cells.
const GIVENS = {
  R1C3: 6, R2C3: 2, R2C4: 7, R2C7: 4, R3C2: 4, R3C7: 6, R3C8: 7,
  R4C2: 3, R4C3: 5, R6C7: 3, R6C8: 5, R7C2: 5, R7C3: 8, R7C8: 3,
  R8C3: 7, R8C6: 5, R8C7: 8, R9C7: 5,
};

// Reads the thermometer as consecutive, non-overlapping digit pairs starting
// at the bulb (list index 0). State tracks the pending tens digit while
// reading a pair's second cell, and the previously-completed pair's value
// (10*tens+ones, so 11..99) so the next pair can be compared to it. Accept
// only on a pair boundary; every drawn thermometer has an even cell count, so
// this never rejects for a stray trailing digit.
const pairSpec = {
  startState: { tens: null, prev: null },
  transition: ({ tens, prev }, value) => {
    if (tens === null) return { tens: value, prev };
    const pair = tens * 10 + value;
    if (prev !== null && pair <= prev) return undefined; // must strictly increase
    return { tens: null, prev: pair };
  },
  accept: ({ tens }) => tens === null,
};
const pairNFA = NFA.encodeSpec(pairSpec, 9);

return [
  new Shape('9x9'),
  ...Object.entries(GIVENS).map(([cell, v]) => new Given(cell, v)),
  ...THERMOMETERS.map((cells) => new NFA(pairNFA, 'doubleDigitThermo', ...cells)),
];
