// Title: Killer Fives
// Author: Imran
// Video: https://www.youtube.com/watch?v=mrto5jWMjCw
// Source: https://cracking-the-cryptic.web.app/sudoku/2TqbJhb4JF

// Normal sudoku rules apply (1-9 in every row, column and 3x3 box; boxes are
// the default regions -- the payload's own `regions` array is exactly the 9
// standard 3x3 blocks). Four 2x2 killer cages show the sum of the digits
// within, digits not repeating in a cage (Cage's standard semantics).
// "Killer Fives": each clue outside the grid gives the sum of the digits in
// that row/column that appear before the digit 5, reading from the edge the
// clue is printed on toward the far edge (the 5 itself is excluded; a clue
// of 0 means the nearest cell to that edge already holds the 5). No givens.

// Killer cages, as drawn.
const cages = [
  new Cage(22, 'R3C3', 'R3C4', 'R4C4', 'R4C3'),
  new Cage(10, 'R3C6', 'R3C7', 'R4C7', 'R4C6'),
  new Cage(19, 'R6C3', 'R6C4', 'R7C4', 'R7C3'),
  new Cage(28, 'R6C6', 'R6C7', 'R7C7', 'R7C6'),
];

// "Before the 5" NFA: scans a row/column in the direction named by the clue,
// accumulating the sum of digits seen so far. On hitting a 5 the machine
// locks the running sum as the final answer (later cells no longer change
// state); it accepts iff a 5 was seen and the locked sum equals the clue's
// target. The sum is clamped at target+1 (a permanent-fail sink) to keep the
// compiled state count bounded.
function beforeFiveNFA(target) {
  const spec = {
    startState: { sum: 0, locked: false },
    transition: ({ sum, locked }, value) => {
      if (locked) return { sum, locked };
      if (value === 5) return { sum, locked: true };
      return { sum: Math.min(sum + value, target + 1), locked: false };
    },
    accept: ({ sum, locked }) => locked && sum === target,
  };
  return NFA.encodeSpec(spec, 9);
}

// Right-of-row clue targets, R1..R9 -- read starting at column 9 (nearest
// the clue) moving to column 1.
const rowTargets = [13, 12, 32, 0, 24, 40, 1, 19, 39];
const rowNFAs = rowTargets.map((target, i) => {
  const row = i + 1;
  const cells = [];
  for (let col = 9; col >= 1; col--) cells.push(makeCellId(row, col));
  return new NFA(beforeFiveNFA(target), 'BeforeFiveRow', ...cells);
});

// Top-of-column clue targets, C1..C9 -- read starting at row 1 (nearest the
// clue) moving to row 9.
const colTargets = [25, 40, 6, 38, 0, 10, 3, 29, 21];
const colNFAs = colTargets.map((target, i) => {
  const col = i + 1;
  const cells = [];
  for (let row = 1; row <= 9; row++) cells.push(makeCellId(row, col));
  return new NFA(beforeFiveNFA(target), 'BeforeFiveCol', ...cells);
});

return [
  new Shape('9x9'),
  ...cages,
  ...rowNFAs,
  ...colNFAs,
];
