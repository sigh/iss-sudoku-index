// Title: August 5, 2021: Round Off
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=jWpJqOra_Jk
// Source: https://tinyurl.com/pc8c2cw7

// Normal Sudoku rules apply (default row/column/box all-different). Each
// two-cell cage holds a two-digit number: the tens digit is the cage's first
// cell in reading order (left cell for a horizontal cage, top cell for a
// vertical cage), the ones digit is the other cell. The clue printed in the
// cage's corner is that number rounded to the nearest 10, with a units digit
// of 5 rounding up.

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// Grid digits are 1-9 (no 0 digit), so "round to nearest 10, 5s round up" is
// exactly Math.round, which already rounds x.5 away from zero for the
// positive values here.
function roundsTo(value) {
  return (tens, ones) => Math.round((10 * tens + ones) / 10) * 10 === value;
}

// Cage cells and corner clues, transcribed from the puzzle's drawn cages.
const cages = [
  { cells: ['R1C1', 'R1C2'], value: 10 },
  { cells: ['R1C8', 'R1C9'], value: 20 },
  { cells: ['R9C8', 'R9C9'], value: 30 },
  { cells: ['R3C7', 'R3C8'], value: 80 },
  { cells: ['R3C2', 'R3C3'], value: 80 },
  { cells: ['R7C2', 'R7C3'], value: 90 },
  { cells: ['R7C7', 'R7C8'], value: 90 },
  { cells: ['R1C5', 'R2C5'], value: 60 },
  { cells: ['R3C9', 'R4C9'], value: 70 },
  { cells: ['R3C5', 'R4C5'], value: 40 },
  { cells: ['R3C1', 'R4C1'], value: 60 },
  { cells: ['R5C1', 'R5C2'], value: 30 },
  { cells: ['R6C1', 'R7C1'], value: 30 },
  { cells: ['R5C3', 'R5C4'], value: 40 },
  { cells: ['R5C6', 'R5C7'], value: 90 },
  { cells: ['R5C8', 'R5C9'], value: 70 },
  { cells: ['R6C9', 'R7C9'], value: 30 },
  { cells: ['R8C5', 'R9C5'], value: 60 },
  { cells: ['R6C5', 'R7C5'], value: 40 },
  { cells: ['R9C1', 'R9C2'], value: 40 },
];

// One Pair.fnToKey per distinct corner value; cages sharing a clue reuse the
// same predicate/key instead of generating an equivalent one repeatedly.
const keyByValue = new Map();
function keyFor(value) {
  if (!keyByValue.has(value)) {
    keyByValue.set(value, Pair.fnToKey(roundsTo(value), 9));
  }
  return keyByValue.get(value);
}

const cageConstraints = cages.map(({ cells, value }) => {
  const [tensCell, onesCell] = rowMajor(cells);
  return new Pair(keyFor(value), `round to ${value}`, tensCell, onesCell);
});

return [new Shape('9x9'), ...cageConstraints];
