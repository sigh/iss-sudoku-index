// Title: Lonely Fives
// Author: Scojo
// Video: https://www.youtube.com/watch?v=vFZ7Vk6IWRY
// Source: https://sudokupad.app/1f53g3ay0v

const constraints = [new Shape('9x9')];
const add = (...items) => constraints.push(...items);

const noBothFive = PairX.fnToKey((a, b) => !(a === 5 && b === 5), 9);
const tentropyPair = Pair.fnToKey((a, b) => {
  if (a === 5 || b === 5) return false;
  return Math.min(a, 10 - a) !== Math.min(b, 10 - b);
}, 9);

// Anti-Queen Fives: every long diagonal can contain at most one 5.
function addAntiQueenFives() {
  const diagonals = [];
  for (let startCol = 1; startCol <= 9; startCol++) {
    diagonals.push(diagonal(1, startCol, 1, 1));
    diagonals.push(diagonal(1, startCol, 1, -1));
  }
  for (let startRow = 2; startRow <= 9; startRow++) {
    diagonals.push(diagonal(startRow, 1, 1, 1));
    diagonals.push(diagonal(startRow, 9, 1, -1));
  }

  for (const cells of diagonals) {
    if (cells.length >= 2) add(new PairX(noBothFive, 'anti-queen fives', ...cells));
  }
}

function diagonal(row, col, rowStep, colStep) {
  const cells = [];
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += rowStep;
    col += colStep;
  }
  return cells;
}

// A 4-cell Tentropy window must use all four non-5 ten-pair classes. Equivalently,
// cells at cyclic distance 1, 2, or 3 on a Tentropy loop must be in different
// ten-pair classes, and none of them can be 5.
function addTentropyLoop(cells) {
  const seen = new Set();
  for (let i = 0; i < cells.length; i++) {
    for (let dist = 1; dist <= 3; dist++) {
      const a = cells[i];
      const b = cells[(i + dist) % cells.length];
      const key = [a, b].sort().join('/');
      if (seen.has(key)) continue;
      seen.add(key);
      add(new Pair(tentropyPair, 'tentropy window', a, b));
    }
  }
}

addAntiQueenFives();

addTentropyLoop([
  'R3C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R3C2',
  'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8',
]);
addTentropyLoop([
  'R6C7', 'R6C8', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R9C5', 'R9C4',
  'R9C3', 'R9C2', 'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R6C5', 'R6C6',
]);

add(
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R8C8', 'R9C8'),
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R8C5', 'R9C5'),
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R7C4', 'R7C5'),
  new BlackDot('R5C7', 'R5C8'),
);

return constraints;
