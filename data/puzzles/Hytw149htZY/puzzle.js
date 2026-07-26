// Title: Zodiac Project: Taurus
// Author: ThePedallingPianist & Friends
// Video: https://www.youtube.com/watch?v=Hytw149htZY
// Source: https://sudokupad.app/ksj8nzm463

// Standard 9x9 sudoku (rows/columns/boxes, no wraparound). Four givens.
//
// Bulls (9 cells): AllDifferent among them.
// Red Flags (9 cells): AllDifferent among them, and each Flag's digit is
//   "friendly" - equal to its own row, column, or box number (1-9,
//   boxes numbered in reading order) - encoded as a multi-value Given
//   restricting that cell's candidates to {row, col, box}.
//
// Omitted: the nine diagonal "Taurus Torus" lines (each Bull's digit is the
// mean of all digits on its line; different lines do not cross or share
// cells). Only the Bull/Flag cell positions below are known; which further
// cells belong to each line, and how far a line extends past its Bull/Flag,
// is drawn only in the image/video and is not recoverable from the decoded
// data.

const givens = [
  // R1C7=6, R2C5=4, R4C1=8, R6C9=2.
  new Given('R1C7', 6),
  new Given('R2C5', 4),
  new Given('R4C1', 8),
  new Given('R6C9', 2),
];

const bulls = [
  // Bull cell positions, from the drawn underlay markers.
  'R1C1', 'R2C2', 'R3C1', 'R1C9', 'R7C9', 'R9C9', 'R9C2', 'R8C3', 'R1C5',
];

const flags = [
  // Red Flag cell positions, from the drawn underlay markers.
  'R1C3', 'R2C7', 'R2C9', 'R8C7', 'R8C8', 'R6C5', 'R6C4', 'R4C6', 'R8C2',
];

// Friendly digit set (row, column, box number) per Flag cell, deduplicated.
// Boxes numbered 1-9 in reading order.
const friendlyFlags = [
  new Given('R1C3', 1, 3),       // row1, col3, box1
  new Given('R2C7', 2, 3, 7),    // row2, col7, box3
  new Given('R2C9', 2, 3, 9),    // row2, col9, box3
  new Given('R8C7', 7, 8, 9),    // row8, col7, box9
  new Given('R8C8', 8, 9),       // row8, col8, box9
  new Given('R6C5', 5, 6),       // row6, col5, box5
  new Given('R6C4', 4, 5, 6),    // row6, col4, box5
  new Given('R4C6', 4, 5, 6),    // row4, col6, box5
  new Given('R8C2', 2, 7, 8),    // row8, col2, box7
];

return [
  new Shape('9x9'),
  ...givens,
  new AllDifferent(...bulls),
  new AllDifferent(...flags),
  ...friendlyFlags,
];
