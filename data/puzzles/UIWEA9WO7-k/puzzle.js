// Title: Renban Sudoku:  Try This Stunning Themed Puzzle
// Author: 
// Video: https://www.youtube.com/watch?v=UIWEA9WO7-k
// Source: https://cracking-the-cryptic.web.app/sudoku/gmpMJRd7Nr

// The payload carries no rules text; the ruleset is read from the video
// description, which links this exact source URL and names the source as a
// "Renban Sudoku" blog puzzle (Life In Sudoku, puzzle 41), matching the
// video's own title.
//
// Normal sudoku rules apply (default rows/cols/3x3 boxes, matching the
// payload's drawn `regions`). Each grey line's digits form a non-repeating,
// consecutive set, in any order -> Renban.

const givens = [
  new Given('R1C1', 4),
  new Given('R1C3', 8),
  new Given('R1C6', 3),
  new Given('R5C4', 9),
  new Given('R6C2', 2),
  new Given('R6C7', 1),
  new Given('R6C8', 4),
  new Given('R7C1', 9),
  new Given('R8C9', 9),
  new Given('R9C2', 7),
  new Given('R9C3', 1),
  new Given('R9C4', 3),
  new Given('R9C6', 2),
  new Given('R9C7', 4),
  new Given('R9C8', 5),
];

// Grey (#CFCFCF) lines, cells transcribed from the payload's `lines` array
// waypoints (drawn order; Renban is set-based, so order does not matter for
// the rule). A cell a stroke revisits where it crosses itself is listed
// once. The payload's own line entries 0-1 and 1-2 meet end to end at
// R3C1 and R3C3 respectively (drawn as one continuous same-style stroke,
// confirmed by the payload's own junction data: guest/host endpoints
// coincide exactly), so those three entries are one Renban clue, not
// three independent ones; treating them as three separate Renban lines is
// unsatisfiable together with the R1C1/R1C3/R7C1 givens (refuted by
// solve.js), which is exactly what a merged 7-cell reading resolves.
// Entries 3-4 meet the same way at R1C4 and are merged for the same reason.
// The 4th merged line's second leg runs diagonally corner-to-corner from
// R1C4 through R2C5 to R3C6 before turning to run vertically; the 6th line
// below is a closed loop drawn as a ring around its six cells.
const renbanLines = [
  ['R2C1', 'R3C1', 'R4C1', 'R3C2', 'R3C3', 'R2C3', 'R4C3'],
  ['R3C4', 'R2C4', 'R1C4', 'R2C5', 'R3C6', 'R2C6', 'R1C6'],
  ['R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R4C9', 'R4C8', 'R4C7'],
  ['R6C2', 'R5C2', 'R5C3', 'R6C3', 'R7C3', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R5C4', 'R6C4', 'R7C4', 'R7C5', 'R6C5', 'R5C5'],
  ['R6C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R8C6', 'R8C8'],
  ['R5C8', 'R6C8', 'R7C8', 'R7C9', 'R6C9', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines.map(cells => new Renban(...cells)),
];
