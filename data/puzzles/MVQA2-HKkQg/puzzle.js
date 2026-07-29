// Title: Miracle of the Magic Squares
// Author: BobZeBuilder
// Video: https://www.youtube.com/watch?v=MVQA2-HKkQg
// Source: https://app.crackingthecryptic.com/mds9euoo1c

// Standard Sudoku. The box-centre Special Square is a Magic Square. Exactly
// one main-diagonal cell breaks the stated distance-from-index rule. The five
// otherwise-identical Magic Squares and their rotated-layout relation are
// omitted because the source supplies no locations or geometry for them.
const special = [
  ['R2C2', 'R2C5', 'R2C8'],
  ['R5C2', 'R5C5', 'R5C8'],
  ['R8C2', 'R8C5', 'R8C8'],
];
const specialSegments = [
  ...special,
  ['R2C2', 'R5C2', 'R8C2'], ['R2C5', 'R5C5', 'R8C5'], ['R2C8', 'R5C8', 'R8C8'],
  ['R2C2', 'R5C5', 'R8C8'], ['R2C8', 'R5C5', 'R8C2'],
];

// RnCn is normally forbidden from n-1, n, n+1. The NFA scans the diagonal
// row-major and permits exactly one such exception, whose position is unknown.
const naughtyDiagonal = NFA.encodeSpec({
  startState: {index: 1, naughty: 0},
  transition: ({index, naughty}, value) => {
    const nextNaughty = naughty + (Math.abs(value - index) <= 1 ? 1 : 0);
    return nextNaughty > 1 ? undefined : {index: index + 1, naughty: nextNaughty};
  },
  accept: ({index, naughty}) => index === 10 && naughty === 1,
  maxDepth: 9,
}, 9);

return [
  new Shape('9x9'),
  new EqualSum(...specialSegments),
  new NFA(naughtyDiagonal, 'one-naughty-diagonal-cell',
    'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
];
