// Title: Oct 19, 2021: Even Count
// Author: Clover
// Video: https://www.youtube.com/watch?v=LA09l0yzo4g
// Source: https://app.crackingthecryptic.com/sudoku/Bjrn4rQ2bH

// Normal sudoku rules apply (9x9, standard 3x3 boxes).
// Each circle is labelled with the count of even digits among the 4 cells at
// its corner junction; repeats among those four cells are allowed by the
// rule, so no AllDifferent is added.
// Encoded as one small NFA per circle: state is a running count of even
// digits seen so far, clamped at n+1 once the target n can no longer be met;
// accept requires the count equal the circle's fixed label after all 4 cells
// have been scanned.

function evenCountNFA(n) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => Math.min(count + (value % 2 === 0 ? 1 : 0), n + 1),
    accept: (count) => count === n,
  }, 9);
}

const circles = [
  [2, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [2, ['R3C6', 'R3C7', 'R4C6', 'R4C7']],
  [1, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  [1, ['R6C3', 'R6C4', 'R7C3', 'R7C4']],
  [4, ['R4C4', 'R4C5', 'R5C4', 'R5C5']],
  [4, ['R3C3', 'R3C4', 'R4C3', 'R4C4']],
  [4, ['R2C2', 'R2C3', 'R3C2', 'R3C3']],
  [3, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C5', 1),
  new Given('R1C6', 3),
  new Given('R2C6', 5),
  new Given('R5C1', 2),
  new Given('R5C8', 7),
  new Given('R5C9', 9),
  new Given('R6C1', 4),
  new Given('R6C2', 6),
  new Given('R6C8', 2),
  new Given('R7C7', 9),
  new Given('R8C5', 2),
  new Given('R8C6', 4),
  new Given('R9C5', 3),
  new Given('R9C9', 5),

  ...circles.map(([n, cells]) => new NFA(evenCountNFA(n), `EvenCount${n}`, ...cells)),
];
