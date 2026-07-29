// Title: Doctor, my fever might be odd
// Author: PhysicistFromFunen
// Video: https://www.youtube.com/watch?v=iCXQ26GNjDY
// Source: https://sudokupad.app/9jLmRBJ3JH

// Normal Sudoku rules apply. On each orange thermometer, odd digits strictly
// increase from the bulb and outnumber even digits; blue thermometers apply the
// corresponding rule to even digits.
const orangeThermos = [
  ['R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1'],
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'],
  ['R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R8C5', 'R8C4'],
  ['R4C9', 'R5C9', 'R5C8', 'R5C7'],
  ['R6C7', 'R6C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R5C4', 'R5C5', 'R5C6'],
];
const blueThermos = [
  ['R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1'],
  ['R9C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R7C8'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2'],
  ['R8C6', 'R7C6', 'R7C5', 'R7C4'],
  ['R3C5', 'R2C5'],
  ['R4C5', 'R4C4', 'R4C3', 'R4C2', 'R5C2', 'R5C3'],
];

// The NFA state keeps the previous restricted-parity digit plus its count and
// the path length, so it checks both restricted-digit order and strict majority.
const feverSpec = (restrictedParity) => NFA.encodeSpec({
  startState: { previous: 0, restricted: 0, length: 0 },
  transition: ({ previous, restricted, length }, value) => {
    if (value % 2 !== restrictedParity) return { previous, restricted, length: length + 1 };
    if (value <= previous) return undefined;
    return { previous: value, restricted: restricted + 1, length: length + 1 };
  },
  accept: ({ restricted, length }) => 2 * restricted > length,
  maxDepth: 6,
}, 9);

const orangeFever = feverSpec(1);
const blueFever = feverSpec(0);

return [
  new Shape('9x9'),
  ...orangeThermos.map((cells) => new NFA(orangeFever, 'orange odd fever', ...cells)),
  ...blueThermos.map((cells) => new NFA(blueFever, 'blue even fever', ...cells)),
];
