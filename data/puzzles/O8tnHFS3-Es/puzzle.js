// Title: 10:01 AM
// Author: CaptZebraCakes
// Video: https://www.youtube.com/watch?v=O8tnHFS3-Es
// Source: https://sudokupad.app/4fxnvktjvn

// Normal sudoku rules apply. Grey lines are palindromes. Each orange line is
// partitioned into consecutive positive-digit groups totalling 10; white dots
// mark consecutive pairs, and dots are not exhaustive.

const palindromes = [
  ['R2C1', 'R3C2', 'R4C2', 'R5C1', 'R5C2'],
  ['R9C5', 'R8C5', 'R8C6', 'R9C7', 'R8C8'],
  ['R7C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R4C8', 'R3C8', 'R2C7', 'R1C6', 'R2C5', 'R3C4'],
]; // Grey palindrome paths from the source's palindrome entries.

const tenLines = [
  ['R7C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C4', 'R5C5', 'R6C5', 'R6C6', 'R7C7', 'R8C7', 'R9C7'],
  ['R5C9', 'R5C8', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  ['R3C1', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R2C4', 'R2C5'],
]; // Orange rendered line paths from the source geometry.

const whiteDots = [
  ['R4C2', 'R4C3'],
  ['R8C8', 'R8C9'],
]; // The two source difference entries (white dots).

// State `sum` is the unfinished group's total. A transition reaching 10
// starts the next group; positive grid digits make that partition unique.
const tenLineMachine = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, digit) => {
    const next = sum + digit;
    return next > 10 ? undefined : { sum: next === 10 ? 0 : next };
  },
  accept: ({ sum }) => sum === 0,
}, 9);

return [
  new Shape('9x9'),
  new Given('R9C9', 1),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...tenLines.map(cells => new NFA(tenLineMachine, '10 line', ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
