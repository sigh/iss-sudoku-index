// Title: Aug 11, 2021: Coast to Coast
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://tinyurl.com/r7rz3fxt
//
// Normal sudoku rules. Five rows carry a printed outside-clue pair of digits
// to their left (rows 3-7): "if two digits are given outside the grid, then
// they must appear (in either order) in symmetric positions in the first and
// last three cells of that row" -- one of the pair in column c (c in 1..3),
// the other in column 10-c.
//
// Encoded per outside-clue row as an Or over the three symmetric column
// pairs (1,9) (2,8) (3,7): for the chosen pair, both cells are restricted to
// the clue's two digits via Given(cell, a, b). Row all-different then forces
// the two cells to take the two different digits, in either order, which is
// exactly the rule's "in either order" -- no extra ordering constraint is
// added.

const outsideClues = [
  // [row, digitA, digitB], transcribed from the R{row}C0 text overlay.
  [3, 1, 4],
  [4, 1, 2],
  [5, 2, 7],
  [6, 4, 7],
  [7, 2, 4],
];

const symmetricPairs = outsideClues.map(([row, a, b]) => {
  const orParts = [1, 2, 3].map(c => new And([
    new Given(makeCellId(row, c), a, b),
    new Given(makeCellId(row, 10 - c), a, b),
  ]));
  return new Or(orParts);
});

return [
  new Shape('9x9'),

  new Given('R1C2', 3), new Given('R1C4', 1), new Given('R1C8', 7),
  new Given('R2C5', 2),
  new Given('R3C1', 7), new Given('R3C6', 3), new Given('R3C9', 2),
  new Given('R4C6', 4),
  new Given('R5C2', 1), new Given('R5C5', 5), new Given('R5C8', 3),
  new Given('R6C4', 6),
  new Given('R7C1', 5), new Given('R7C4', 7), new Given('R7C9', 1),
  new Given('R8C5', 8),
  new Given('R9C2', 2), new Given('R9C6', 9), new Given('R9C8', 6),

  ...symmetricPairs,
];
