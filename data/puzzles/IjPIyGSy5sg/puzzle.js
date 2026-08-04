// Title: Unpredictable Housing Conditions
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=IjPIyGSy5sg
// Source: https://app.crackingthecryptic.com/sudoku/NqDbQ8QTG2

// Normal sudoku rules apply, standard 3x3 boxes.
// The digit in the grey circle on R4C7 is odd -- encoded as a candidate
// restriction with Given.
// Outside clues: for each clue's digit set S attached to a row or column,
// scan outward from the clue in three-cell boxes -- exactly one digit of S
// sits in the second box (cells 4-6 from the clue) and every other digit of
// S sits in the first, nearest box (cells 1-3); digits not in S may sit
// anywhere. Applied to a single-digit clue, "all other digits" is vacuous
// and "exactly one digit is found ... in the second box" still holds, so
// that digit is forced into the second box rather than the first.
// Modeled as one custom NFA per clue lane, scanning that lane's 9 cells
// nearest-clue-first. State is {pos, first, second}: pos counts consumed
// cells (bounds the machine via maxDepth); first/second count S-digits seen
// in the first/second box respectively. A clue digit reaching the third box
// (pos 6-8) rejects immediately.
const outsideClueNFA = (digits) => {
  const set = new Set(digits);
  return NFA.encodeSpec({
    startState: { pos: 0, first: 0, second: 0 },
    transition: ({ pos, first, second }, value) => {
      const inSet = set.has(value);
      if (pos < 3) {
        if (inSet) first += 1;
      } else if (pos < 6) {
        if (inSet) second += 1;
      } else if (inSet) {
        return undefined;
      }
      return { pos: pos + 1, first, second };
    },
    accept: ({ first, second }) => first === set.size - 1 && second === 1,
    maxDepth: 9,
  }, 9);
};

const digitsOf = (n) => String(n).split('').map(Number);

// Clue digit sets by lane, transcribed from the outside text clues drawn
// beside each row/column.
const topClues = { 1: 34, 2: 5678, 3: 9, 5: 17, 6: 78, 7: 35, 8: 1, 9: 23 };
const leftClues = { 1: 12, 2: 8, 3: 17, 4: 78, 5: 9, 6: 1, 7: 3458, 8: 679 };
const rightClues = { 1: 2456, 2: 789, 4: 17, 5: 678, 6: 2, 7: 1, 8: 2345, 9: 789 };
const bottomClues = { 1: 12, 2: 3, 3: 5, 4: 17, 5: 78, 6: 6, 7: 234, 8: 569, 9: 9 };

const outsideConstraints = [];

// Top clues read top-to-bottom: nearest box is R1-R3, second box R4-R6.
for (const [colStr, value] of Object.entries(topClues)) {
  const col = Number(colStr);
  const cells = [];
  for (let row = 1; row <= 9; row++) cells.push(makeCellId(row, col));
  outsideConstraints.push(
    new NFA(outsideClueNFA(digitsOf(value)), `TopC${col}`, ...cells));
}

// Left clues read left-to-right: nearest box is C1-C3, second box C4-C6.
for (const [rowStr, value] of Object.entries(leftClues)) {
  const row = Number(rowStr);
  const cells = [];
  for (let col = 1; col <= 9; col++) cells.push(makeCellId(row, col));
  outsideConstraints.push(
    new NFA(outsideClueNFA(digitsOf(value)), `LeftR${row}`, ...cells));
}

// Right clues read right-to-left: nearest box is C9-C7, second box C6-C4.
for (const [rowStr, value] of Object.entries(rightClues)) {
  const row = Number(rowStr);
  const cells = [];
  for (let col = 9; col >= 1; col--) cells.push(makeCellId(row, col));
  outsideConstraints.push(
    new NFA(outsideClueNFA(digitsOf(value)), `RightR${row}`, ...cells));
}

// Bottom clues read bottom-to-top: nearest box is R9-R7, second box R6-R4.
for (const [colStr, value] of Object.entries(bottomClues)) {
  const col = Number(colStr);
  const cells = [];
  for (let row = 9; row >= 1; row--) cells.push(makeCellId(row, col));
  outsideConstraints.push(
    new NFA(outsideClueNFA(digitsOf(value)), `BottomC${col}`, ...cells));
}

return [
  new Shape('9x9'),
  new Given('R4C7', 1, 3, 5, 7, 9),
  ...outsideConstraints,
];
