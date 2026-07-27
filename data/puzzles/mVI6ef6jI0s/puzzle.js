// Title: Moving Day?
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=mVI6ef6jI0s
// Source: https://sudokupad.app/eh7t6u3zz8

// "Select six different digits from the set 1-9. Use these six digits only to
// fill every cell such that a digit does not repeat in a row, column or box."
// -> widen Shape's value range to 9 (cell count stays 6x6) and add
// RegionSameValues so every row/column/box is forced to agree on one
// six-digit alphabet drawn from 1-9. The default 6x6 box tiling (six 2-row x
// 3-column boxes) already matches the puzzle's drawn regions, so no
// RegionSize/Jigsaw override is needed.
const shape = new Shape('6x6', 9);

// "Grey lines are entropic AND modular; i.e every 3-cell sequence on a line
// must contain a digit from {123}, one from {456} and {789}; also these
// digits must include one from {147}, one from {258} and one from {369}."
// Entropic and Modular(3) both apply to every sequential 3-cell window of the
// ordered cell list they are given, so passing each line's 4 cells once
// covers both windows. Line cells are read off the drawn grey `lines` array
// (5 lines of 4 cells each).
const greyLines = [
  ['R5C1', 'R4C1', 'R3C2', 'R2C2'],
  ['R5C2', 'R4C2', 'R3C3', 'R2C3'],
  ['R5C3', 'R4C3', 'R3C4', 'R2C4'],
  ['R5C4', 'R4C4', 'R3C5', 'R2C5'],
  ['R2C6', 'R3C6', 'R4C5', 'R5C5'],
];
const lineConstraints = greyLines.flatMap(cells => [
  new Entropic(...cells),
  new Modular(3, ...cells),
]);

// "Both indicated diagonals have the same sum." The payload's two off-grid
// arrow marks are short 45-degree strokes just outside the grid, each
// recording an entry point and direction rather than a cell path. Extending
// arrow #0 (enters at the R1C3/R1C4 boundary, heading down-left) across the
// grid gives R1C3-R2C2-R3C1; extending arrow #1 (enters at the R1C1/R1C2
// boundary, heading down-right) gives R1C2-R2C3-R3C4-R4C5-R5C6. The two
// diagonals are different lengths (3 vs 5 cells); the rule only ties their
// totals, not their sizes, so EqualSum expresses it directly without forcing
// what that common sum is.
const diagonalA = ['R1C3', 'R2C2', 'R3C1'];
const diagonalB = ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6'];

// "The inequality sign 'points' to the lower digit." The one overlay is a
// ">" glyph on the edge between R6C2 and R6C3. The vertex of ">" sits on its
// right, so it points at the right-hand cell, making R6C3 the lower digit:
// R6C2 > R6C3.

// "Any 5 in the grid must have a 1 directly above it or a 9 directly below it
// (or both)." Per cell this is NOT(cell=5) OR (up=1) OR (down=9); the "up"
// disjunct is dropped on row 1 (no cell above) and the "down" disjunct is
// dropped on row 6 (no cell below), since those directly-adjacent cells do
// not exist -- not omitted, just vacuously unavailable.
const NOT_FIVE = [1, 2, 3, 4, 6, 7, 8, 9];
const anyFiveConstraints = [];
for (let r = 1; r <= 6; r++) {
  for (let c = 1; c <= 6; c++) {
    const cell = makeCellId(r, c);
    const branches = [new Given(cell, ...NOT_FIVE)];
    if (r > 1) branches.push(new Given(makeCellId(r - 1, c), 1));
    if (r < 6) branches.push(new Given(makeCellId(r + 1, c), 9));
    anyFiveConstraints.push(new Or(branches));
  }
}

return [
  shape,
  new RegionSameValues(),
  ...lineConstraints,
  new EqualSum(diagonalA, diagonalB),
  new GreaterThan('R6C2', 'R6C3'),
  ...anyFiveConstraints,
];
