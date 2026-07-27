// Title: I <3 Sudoku
// Author: PjoeterBliep
// Video: https://www.youtube.com/watch?v=czKO4oGWCW8
// Source: https://sudokupad.app/2oz3qxqcd3

// Standard sudoku (rows/columns/boxes) plus:
// - Renban: darker-magenta lines hold a consecutive set of digits (any order).
// - Region sum line: the blue line has an equal digit sum on every segment
//   it is split into by a box border.
// - Whisper: the green line requires adjacent digits to differ by >= 5; the
//   light-red line requires adjacent digits to differ by >= 7.
// - X: the two digits joined by the X mark sum to 10.
//
// The source draws 7 line strokes across the `lines` array. Most touching
// pairs are independent clues that merely share a cell (a touch is not a
// merge -- e.g. the green/blue diamond outline below), but the two pairs of
// #f067f0 (thickness 10) strokes share both colour and thickness with each
// other and meet at exactly one cell (R1C8; R7C2) -- a polyline cannot fork,
// so a single Renban line that bends sharply enough at one cell is exported
// as two consecutive polyline entries at that cell. Each such pair is
// encoded below as one Renban line over the union of its cells.

return [
  new Shape('9x9'),

  // Renban lines (#f067f0, thickness 10): two bent lines, each split across
  // two `lines` entries at its bend cell (R1C8; R7C2).
  new Renban('R1C7', 'R1C8', 'R2C8', 'R2C7'),
  new Renban('R7C1', 'R7C2', 'R8C2', 'R6C3', 'R5C4', 'R4C5'),

  // Strong whisper (#ffa9a9, "light red"), closed loop; first cell repeated
  // at the end to cover the wrap-around edge.
  new Whisper(7, 'R3C2', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R6C6', 'R5C7',
    'R4C8', 'R3C8', 'R2C7', 'R2C6', 'R3C5', 'R2C4', 'R2C3', 'R3C2'),

  // German whisper (#67f067, "green").
  new Whisper(5, 'R6C2', 'R7C3', 'R8C4'),

  // Region sum line (#2ecbff, "blue"). RegionSumLine enforces an equal sum
  // per box the line passes through; this line crosses a box border 4 times
  // (3/3/3/1/3 cells), giving the rules' 5 segments under the default boxes.
  new RegionSumLine('R6C2', 'R5C2', 'R4C3', 'R4C4', 'R5C5', 'R4C6', 'R4C7',
    'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R9C5', 'R8C4'),

  // X mark: adjacent digits sum to 10.
  new X('R8C4', 'R9C4'),
];
