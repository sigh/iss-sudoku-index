// Title: Duplexity
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=qB0F3NJTkGc
// Source: https://app.crackingthecryptic.com/sudoku/pRpLjmp6j8

// Normal sudoku rules apply (standard rows/cols/boxes, from Shape('9x9')).
// The purple/blue lines are "equal sum lines": within each 3x3 box a line
// passes through, the digits on the line restricted to that box sum to the
// same total as every other box the line passes through (RegionSumLine
// enforces exactly this per-box-segment equal-sum semantics). The digits
// along the whole line also form a set of non-repeating consecutive numbers
// in any order (Renban over the same cell list).
//
// The payload draws every line twice (deepskyblue then purple, matching the
// rules text's "purple/blue" description) covering identical edges; each is
// encoded once below. Cell lists are transcribed from the drawn line paths.

const lines = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4'],
  ['R9C5', 'R8C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R6C7', 'R7C7', 'R7C8'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8'],
];

return [
  new Shape('9x9'),
  new Given('R2C3', 5),
  ...lines.map((cells) => new RegionSumLine(...cells)),
  ...lines.map((cells) => new Renban(...cells)),
];
