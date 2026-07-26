// Title: Hyperextension
// Author: Matt Tressel and ChinStrap
// Video: https://www.youtube.com/watch?v=ObWwXbJiV_8
// Source: https://sudokupad.app/3gkoee7rau

// Normal sudoku rules apply (Shape gives row/col/box all-different).
//
// Silent Serial Killer: digits do not repeat within a cage, and no total is
// printed. The total is instead read back from the grid, at the cell
// "pointed at by the cage's northwest corner" -- the corner is a grid
// vertex, at the top-left of the cage's own topmost-then-leftmost cell, and
// it points into the cell diagonally up-left of that cell (outside the
// cage). A 1-digit total sits whole in that pointed-at cell; a 2-digit
// total's tens digit sits one further cell to the pointed-at cell's left,
// ones digit in the pointed-at cell itself. A single-cell cage's own digit
// trivially equals its own (always 1-digit) sum, but its pointed-at cell is
// still a distinct diagonal cell, so the placement rule still binds it to
// that cell -- it is not a no-op. Two of the seven cages are single cells,
// and each is exactly the pointed-at cell of a different, larger cage.
//
// Tentropy Lines: every four sequential digits along a peach line must
// contain one digit from each ten-pair {1,9}, {2,8}, {3,7}, {4,6}, and 5 may
// never sit on such a line. "Digits on a line may repeat if allowed by other
// rules" says there is no separate all-different rule for the line itself,
// so only the two rules just stated are encoded for it.

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a), B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// Killer-cage boundaries (no printed totals), converted to R#C#.
const cages = [
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R2C7', 'R2C8', 'R3C8'],
  ['R2C2', 'R2C3', 'R3C2'],
  ['R8C4'],
  ['R4C8', 'R5C8', 'R5C9'],
  ['R7C5', 'R7C6', 'R7C7', 'R8C7'],
  ['R6C4'],
];

function silentKillerCage(cells) {
  // rowMajor's first entry is topmost, then leftmost: the cage's own corner
  // cell. The pointed-at cell is diagonally up-left of it (see header
  // comment); the tens cell, when a 2-digit total needs one, is one more
  // cell to the pointed-at cell's left.
  const corner = rowMajor(cells)[0];
  const { row, col } = parseCellId(corner);
  const pointedCell = makeCellId(row - 1, col - 1);
  const oneDigitTotal = new EqualSum(cells, [pointedCell]); // sum(cells) = pointedCell

  // A single-cell cage's sum is its own digit: always 1-digit (<=9), and
  // never a repeat within itself, so only the placement equation applies.
  if (cells.length === 1) return [oneDigitTotal];

  const allDifferent = new AllDifferent(...cells);

  // Least possible sum of `cells.length` distinct digits from 1-9.
  const minSum = (cells.length * (cells.length + 1)) / 2;
  if (minSum > 9) {
    // A cage this large can never sum to a 1-digit total.
    const tensCell = makeCellId(row - 1, col - 2);
    return [allDifferent,
      new Sum(0, ...cells, [pointedCell, -1], [tensCell, -10])];
  }

  // A smaller cage could go either way -- unless the tens cell would fall
  // off the west edge of the grid, in which case only the 1-digit reading
  // is geometrically possible.
  if (col - 2 < 1) return [allDifferent, oneDigitTotal];
  const tensCell = makeCellId(row - 1, col - 2);
  const twoDigitTotal = new Sum(0, ...cells, [pointedCell, -1], [tensCell, -10]);
  return [allDifferent, new Or([oneDigitTotal, twoDigitTotal])];
}

// Peach line cell paths, in drawn order. A duplicate white outline stroke
// covering the same edges is cosmetic and is not encoded separately.
const tentropyLines = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3'],
  ['R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9'],
  ['R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3'],
  ['R6C7', 'R6C6', 'R7C6', 'R8C6', 'R8C7', 'R8C8'],
  ['R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1'],
  ['R4C3', 'R4C4', 'R5C4', 'R6C4', 'R6C3', 'R6C2'],
];

// Ten-pair group index: {1,9}->0, {2,8}->1, {3,7}->2, {4,6}->3. 5 has no
// group (it is separately excluded from every line cell below), so it is
// given a group no real digit shares.
const TENTROPY_GROUP = { 1: 0, 9: 0, 2: 1, 8: 1, 3: 2, 7: 2, 4: 3, 6: 3, 5: -1 };
const tentropyGroupKey = Pair.fnToKey(
  (a, b) => TENTROPY_GROUP[a] !== TENTROPY_GROUP[b], 9);

function slidingWindows(cells, size) {
  const windows = [];
  for (let i = 0; i + size <= cells.length; i++) {
    windows.push(cells.slice(i, i + size));
  }
  return windows;
}

// PairX applies the key to every pair within the given cells; with a window
// the same size as the number of groups (4), pairwise "different group"
// over the window forces exactly one cell per group -- the same construction
// ISS's own Entropic uses for windows of 3 cells over 3 thirds.
const tentropyWindowConstraints = tentropyLines.flatMap(
  cells => slidingWindows(cells, 4).map(
    w => new PairX(tentropyGroupKey, 'Tentropy', ...w)));

const tentropyLineCells = [...new Set(tentropyLines.flat())];
const noFivesOnLines = tentropyLineCells.map(
  cell => new Given(cell, 1, 2, 3, 4, 6, 7, 8, 9));

return [
  new Shape('9x9'),
  ...cages.flatMap(silentKillerCage),
  ...noFivesOnLines,
  ...tentropyWindowConstraints,
];
