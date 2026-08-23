// Title: Square Wheel
// Author: Twototenth
// Video: https://www.youtube.com/watch?v=lbiyN2Xhr54
// Source: https://app.crackingthecryptic.com/sudoku/3pj77G2R69

// Normal sudoku rules apply (default row/column/box all-different).
// Every drawn cage has no printed total: the rule requires each cage's sum
// to be some perfect square, and digits within a cage must not repeat.
// Each cage is encoded as an Or over one `Cage(square, ...cells)` per square
// that is arithmetically reachable by that many distinct digits from 1-9
// (min = k*(k+1)/2, max = sum of the top k digits) -- Cage itself enforces
// the all-different.
//
// Each of the 3 outside arrows marks a diagonal read in the classic "little
// killer" style: from the edge cell the arrow points to, running to the
// opposite grid edge. That diagonal's sum must also be a perfect square, and repeats are allowed
// on it except where ordinary row/column/box rules already forbid them --
// so it is encoded as an Or over `Sum(square, ...cells)` (Sum allows
// repeats) for every square in the diagonal's reachable range
// (k*1 to k*9, since digits may repeat).

const squareCage = (cells) => {
  const k = cells.length;
  const min = (k * (k + 1)) / 2;
  const max = [...Array(k).keys()].reduce((s, i) => s + (9 - i), 0);
  const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81].filter(
    (s) => s >= min && s <= max
  );
  return new Or(squares.map((s) => new Cage(s, ...cells)));
};

const squareDiagonal = (cells) => {
  const k = cells.length;
  const min = k * 1;
  const max = k * 9;
  const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81].filter(
    (s) => s >= min && s <= max
  );
  return new Or(squares.map((s) => new Sum(s, ...cells)));
};

// Cage cell lists, transcribed from the source cage geometry (0-indexed
// [row,col] converted to R#C#); every cage carries no total.
const cages = [
  ["R1C4", "R1C5", "R1C6"],
  ["R2C4", "R3C4"],
  ["R2C5", "R3C5", "R4C5"],
  ["R2C6", "R2C7", "R1C7"],
  ["R1C9", "R1C8", "R2C8"],
  ["R2C9", "R3C9", "R4C9"],
  ["R3C6", "R3C7", "R3C8"],
  ["R4C2", "R4C3", "R4C4", "R5C4"],
  ["R5C5", "R4C6", "R5C6", "R6C6"],
  ["R4C7", "R4C8", "R5C8"],
  ["R5C2", "R6C2", "R6C3"],
  ["R5C7", "R6C7", "R6C8"],
  ["R5C9", "R6C9", "R7C9", "R7C8"],
  ["R6C4", "R6C5"],
  ["R7C4", "R7C5", "R7C6", "R8C5"],
  ["R7C7", "R8C7"],
  ["R8C3", "R8C4"],
  ["R8C6", "R9C4", "R9C5", "R9C6", "R9C7"],
  ["R8C8", "R9C8"],
  ["R8C9", "R9C9"],
  ["R7C1", "R7C2", "R7C3", "R8C1", "R8C2", "R9C1", "R9C2", "R9C3"],
];

// Diagonal cell lists, walked from each arrow's entry cell (drawn waypoint,
// snapped to the nearest grid edge cell) to the opposite grid edge.
const diagonals = [
  ["R1C4", "R2C3", "R3C2", "R4C1"],
  ["R5C1", "R6C2", "R7C3", "R8C4", "R9C5"],
  ["R5C9", "R4C8", "R3C7", "R2C6", "R1C5"],
];

return [
  new Shape("9x9"),
  ...cages.map(squareCage),
  ...diagonals.map(squareDiagonal),
];
