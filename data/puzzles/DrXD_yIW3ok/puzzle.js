// Title: Projojojomo
// Author: Scojojobo
// Video: https://www.youtube.com/watch?v=DrXD_yIW3ok
// Source: https://sudokupad.app/br70hyi0ur

// Normal sudoku; cipher letters are distinct digits. Green circles give their
// surrounding 2x2 multiset, white dots give an absolute difference, and the two
// identically shaped shaded regions are position-by-position clones.
const letters = new Var('L', 'Cipher letters', 9);
const [B, C, D, J, K, O, S, T, U] = letters.cells();

const quads = [
  ['R1C1', [O, J, S, C]],
  ['R2C6', [O, J, J, O]],
  ['R4C3', [S, U, D]],
  ['R4C4', [O, K, U]],
  ['R5C6', [C, T, C]],
  ['R6C8', [J, O, B, O]],
  ['R8C3', [O, J, O, J]],
];

// A quad scan starts with its cipher letter, then sees the four surrounding
// cells; each listed occurrence requires one matching digit in that 2x2.
const quadSpec = (minimum) => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    return { target, count: Math.min(minimum, count + (value === target ? 1 : 0)) };
  },
  accept: ({ target, count }) => target !== null && count === minimum,
}, 9);

// A difference dot scans its two grid cells then its cipher-letter cell.
const differenceSpec = NFA.encodeSpec({
  startState: { first: null, second: null },
  transition: ({ first, second }, value) => {
    if (first === null) return { first: value, second: null };
    if (second === null) return { first, second: value };
    return { first, second, matches: Math.abs(first - second) === value };
  },
  accept: ({ matches }) => matches === true,
}, 9);

const dots = [
  ['R2C2', 'R2C3', O], ['R4C8', 'R4C9', K], ['R2C5', 'R2C6', D],
  ['R6C1', 'R6C2', C], ['R7C8', 'R8C8', O], ['R1C4', 'R1C5', K],
  ['R6C7', 'R7C7', C], ['R7C4', 'R8C4', S], ['R4C6', 'R4C7', K],
  ['R2C9', 'R3C9', U],
];

// Shaded clone regions, transcribed in corresponding shape order.
const cloneLeft = ['R2C2', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R5C2', 'R4C2', 'R3C2'];
const cloneRight = ['R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C5', 'R8C5', 'R7C5'];

return [
  new Shape('9x9'),
  letters,
  new AllDifferent(B, C, D, J, K, O, S, T, U),
  ...quads.flatMap(([topLeft, values]) =>
    [...new Set(values)].map(value => new NFA(
      quadSpec(values.filter(v => v === value).length),
      'quad', value, ...Quad.cells(topLeft)))),
  ...dots.map(([a, b, difference]) =>
    new NFA(differenceSpec, 'difference dot', a, b, difference)),
  ...cloneLeft.map((cell, i) => new SameValues(2, cell, cloneRight[i])),
];
