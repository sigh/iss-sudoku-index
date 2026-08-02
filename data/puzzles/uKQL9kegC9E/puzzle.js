// Title: Mods
// Author: Marty Sears & ThePedallingPianist
// Video: https://www.youtube.com/watch?v=uKQL9kegC9E
// Source: https://app.crackingthecryptic.com/sudoku/7D4Bdb3NJg

// Normal sudoku applies. Each yellow Same Difference line has one common
// absolute difference on its consecutive edges; that difference is chosen
// independently for each line. Every circled digit counts the circles holding
// that digit, including its own circle.

// Yellow line paths transcribed from the source drawing data.
const SAME_DIFFERENCE_LINES = [
  ['R2C9', 'R1C8', 'R2C7', 'R3C6', 'R3C5', 'R4C5'],
  ['R2C3', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R3C2'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C5'],
  ['R6C1', 'R7C2', 'R7C3'],
  ['R6C6', 'R7C7', 'R7C8', 'R8C8', 'R9C8'],
  ['R8C3', 'R9C2', 'R9C1'],
];

// One NFA state retains the preceding digit and the first edge's difference.
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { previous: null, difference: null },
  transition: ({ previous, difference }, value) => {
    if (previous === null) return { previous: value, difference: null };
    const nextDifference = Math.abs(value - previous);
    if (difference !== null && nextDifference !== difference) return undefined;
    return { previous: value, difference: nextDifference };
  },
  accept: ({ difference }) => difference !== null,
}, 9);

// Circle positions transcribed from the source underlay data.
const CIRCLES = [
  'R2C5', 'R2C6', 'R4C2', 'R5C2',
  'R5C8', 'R6C8', 'R8C4', 'R8C5',
];

return [
  new Shape('9x9'),
  ...SAME_DIFFERENCE_LINES.map(
    (cells, index) => new NFA(sameDifferenceSpec, `same difference ${index + 1}`, ...cells)),
  new CountingCircles(...CIRCLES),
];
