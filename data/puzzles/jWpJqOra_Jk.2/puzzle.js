// Title: Outside Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=jWpJqOra_Jk
// Source: https://tinyurl.com/24ktt57x
//
// Normal Sudoku rules apply. A digit printed outside the grid means that
// digit must appear somewhere in the first three cells in the corresponding
// direction (the three cells nearest that edge, along the row/column the
// clue sits beside). No givens. Every row and column carries an outside
// clue at both ends; a clue group with several stacked digits is that many
// independent "must appear" instances for the same 3-cell target, so one
// ContainAtLeast per clue group (checking presence of every listed digit at
// once) faithfully covers the whole group.
//
// Clue digits transcribed from the payload's outside `text` entries
// (R0C#/R10C#/R#C0/R#C10), one row per side below.

// column -> digits shown above it (targets: rows 1-3 of that column)
const topClues = {
  1: '7_8', 2: '3_4', 3: '5_6', 4: '3_6_9', 5: '1_4_7',
  6: '2_5_8', 7: '2_3', 8: '5_6', 9: '7_8',
};
// column -> digits shown below it (targets: rows 9,8,7 of that column)
const bottomClues = {
  1: '4_5', 2: '6_7', 3: '8_9', 4: '2_5_8', 5: '3_6_9',
  6: '1_4_7', 7: '6_7', 8: '1_2', 9: '4_5',
};
// row -> digits shown left of it (targets: columns 1-3 of that row)
const leftClues = {
  1: '2_3', 2: '4_5', 3: '6_7', 4: '7_8_9', 5: '1_2_3',
  6: '4_5_6', 7: '3_4', 8: '5_6', 9: '7_8',
};
// row -> digits shown right of it (targets: columns 9,8,7 of that row)
const rightClues = {
  1: '8_9', 2: '6_7', 3: '1_2', 4: '4_5_6', 5: '7_8_9',
  6: '1_2_3', 7: '5_6', 8: '7_8', 9: '2_3',
};

const topConstraints = Object.entries(topClues).map(([c, values]) =>
  new ContainAtLeast(values, makeCellId(1, c), makeCellId(2, c), makeCellId(3, c)));
const bottomConstraints = Object.entries(bottomClues).map(([c, values]) =>
  new ContainAtLeast(values, makeCellId(9, c), makeCellId(8, c), makeCellId(7, c)));
const leftConstraints = Object.entries(leftClues).map(([r, values]) =>
  new ContainAtLeast(values, makeCellId(r, 1), makeCellId(r, 2), makeCellId(r, 3)));
const rightConstraints = Object.entries(rightClues).map(([r, values]) =>
  new ContainAtLeast(values, makeCellId(r, 9), makeCellId(r, 8), makeCellId(r, 7)));

return [
  new Shape('9x9'),
  ...topConstraints,
  ...bottomConstraints,
  ...leftConstraints,
  ...rightConstraints,
];
