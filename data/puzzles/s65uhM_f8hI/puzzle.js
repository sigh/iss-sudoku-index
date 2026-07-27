// Title: Facing the Void
// Author: Mile Lemaic
// Video: https://www.youtube.com/watch?v=s65uhM_f8hI
// Source: https://sudokupad.app/75vvw5rjbb

// Normal sudoku rules apply (rows, columns, boxes all-different, the default
// Shape('9x9') behaviour).
// Identical digits cannot be separated by a knight's move: AntiKnight bans
// any two cells a knight's move apart from holding the same value, which is
// exactly this rule (no ordinary anti-knight "all cells a knight's move
// apart differ" rule is stated -- only identical digits are restricted).
// Digits along an arrow sum to the number in the attached circle: Arrow
// takes the bulb/circle cell first, then the arm cells, sum(arm) == bulb.
// Arrow cell paths transcribed from the drawn arrow shafts, cross checked
// against the matching drawn circle positions.

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Arrow('R7C1', 'R6C2', 'R5C3', 'R4C3', 'R3C3'),
  new Arrow('R2C8', 'R3C7', 'R2C6'),
  new Arrow('R4C4', 'R5C4', 'R4C5', 'R3C5', 'R3C6'),
];
