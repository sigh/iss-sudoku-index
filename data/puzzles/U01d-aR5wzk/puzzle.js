// Title: Modulo Madness
// Author: Greenchecker34
// Video: https://www.youtube.com/watch?v=U01d-aR5wzk
// Source: https://app.crackingthecryptic.com/rrJqp84BHN

// Normal Sudoku applies. The drawn cages are sum-only; every three consecutive
// cells on a red line sum to a multiple of 3. The explicit white dot is
// consecutive; absent white dots are unconstrained.
const tripleModuloThree = NFA.encodeSpec({
  startState: { first: null, second: null },
  transition({ first, second }, value) {
    const residue = value % 3;
    if (first === null) return { first: residue, second: null };
    if (second === null) return { first, second: residue };
    if ((first + second + residue) % 3 !== 0) return undefined;
    return { first: second, second: residue };
  },
  accept: ({ first }) => first !== null,
}, 9);

// Paths transcribed from the nine drawn red lines.
const redLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C4', 'R5C3', 'R6C3', 'R7C2', 'R8C2'],
  ['R1C9', 'R1C8', 'R1C7', 'R2C6', 'R3C6', 'R4C6', 'R5C7', 'R6C7', 'R7C8', 'R8C8'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R9C1', 'R9C2', 'R9C3'],
  ['R4C1', 'R4C2', 'R4C3'],
];

return [
  new Shape('9x9'),
  // Cage cell lists and totals transcribed from the drawn cages.
  new Sum(25, 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Sum(22, 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Sum(8, 'R8C8', 'R8C9'),
  new Sum(9, 'R3C8', 'R3C9'),
  new Sum(9, 'R2C7', 'R2C8'),
  new Sum(9, 'R2C2', 'R2C3'),
  new Sum(10, 'R3C1', 'R3C2'),
  new Sum(9, 'R8C1', 'R8C2'),
  ...redLines.map(cells => new NFA(tripleModuloThree, 'sum mod 3', cells)),
  new WhiteDot('R6C4', 'R7C4'),
];
