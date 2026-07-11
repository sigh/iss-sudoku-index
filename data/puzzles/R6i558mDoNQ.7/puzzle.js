// Title: Stuck in the Middle with You
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/3sawpytz

// Normal sudoku with given digits. Clues outside the grid give the middle
// (median) of the first three digits seen from that direction.

const givens = [
  ['R2C2', 8],
  ['R2C8', 6],
  ['R3C5', 3],
  ['R4C4', 2],
  ['R4C6', 6],
  ['R5C3', 1],
  ['R5C5', 5],
  ['R5C7', 9],
  ['R6C4', 4],
  ['R6C6', 8],
  ['R7C5', 7],
  ['R8C2', 4],
  ['R8C8', 2],
];

const middleClues = [
  [6, ['R5C1', 'R5C2', 'R5C3']],
  [4, ['R5C9', 'R5C8', 'R5C7']],
  [4, ['R1C5', 'R2C5', 'R3C5']],
  [6, ['R9C5', 'R8C5', 'R7C5']],
  [2, ['R2C1', 'R2C2', 'R2C3']],
  [8, ['R8C9', 'R8C8', 'R8C7']],
  [8, ['R1C8', 'R2C8', 'R3C8']],
  [2, ['R9C2', 'R8C2', 'R7C2']],
  [7, ['R4C1', 'R4C2', 'R4C3']],
  [6, ['R6C9', 'R6C8', 'R6C7']],
  [7, ['R1C4', 'R2C4', 'R3C4']],
  [4, ['R9C6', 'R8C6', 'R7C6']],
  [7, ['R1C2', 'R2C2', 'R3C2']],
  [3, ['R9C8', 'R8C8', 'R7C8']],
  [6, ['R9C9', 'R9C8', 'R9C7']],
  [7, ['R9C1', 'R8C1', 'R7C1']],
  [4, ['R1C1', 'R1C2', 'R1C3']],
  [3, ['R1C9', 'R2C9', 'R3C9']],
];

function middleOfThree(value, cells) {
  const lower = range(1, value - 1);
  const higher = range(value + 1, 9);
  const branches = [];
  for (let middleIndex = 0; middleIndex < 3; middleIndex++) {
    const other = [0, 1, 2].filter(i => i !== middleIndex);
    branches.push(new And([
      new Given(cells[middleIndex], value),
      new Given(cells[other[0]], ...lower),
      new Given(cells[other[1]], ...higher),
    ]));
    branches.push(new And([
      new Given(cells[middleIndex], value),
      new Given(cells[other[0]], ...higher),
      new Given(cells[other[1]], ...lower),
    ]));
  }
  return new Or(branches);
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...middleClues.map(([value, cells]) => middleOfThree(value, cells)),
];
