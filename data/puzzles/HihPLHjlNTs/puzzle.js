// Title: Crystal
// Author: Qodec
// Video: https://www.youtube.com/watch?v=HihPLHjlNTs
// Source: https://app.crackingthecryptic.com/sudoku/fBR7n3H4Dg
//
// Normal sudoku rules apply. Ten circles are joined by 18 purple lines into a
// lattice; each line's interior cells must be strictly between the digits in
// its two circled endpoints (Between: one endpoint is the line's max, the
// other its min -- not fixed by the drawing, and can differ line by line).
// Circles are shared endpoints of several lines (R3C3, R5C5, R7C3, R7C7).

// Line paths, first/last cell circled. Transcribed from the drawn purple
// (#D23BE7) lines in source order; three same-coloured entries render
// nothing (no drawn path) and are omitted.
const betweenLines = [
  ['R1C1', 'R2C2', 'R3C3'],   // line #0
  ['R3C3', 'R4C4', 'R5C5'],   // line #1
  ['R5C1', 'R4C2', 'R3C3'],   // line #2
  ['R5C1', 'R6C2', 'R7C3'],   // line #3
  ['R9C1', 'R8C2', 'R7C3'],   // line #4
  ['R7C3', 'R6C4', 'R5C5'],   // line #5
  ['R7C3', 'R8C4', 'R9C5'],   // line #6
  ['R9C5', 'R8C6', 'R7C7'],   // line #7
  ['R5C5', 'R6C6', 'R7C7'],   // line #8
  ['R7C7', 'R6C8', 'R5C9'],   // line #9
  ['R7C7', 'R8C8', 'R9C9'],   // line #10
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],   // line #11
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],   // line #12
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],   // line #13
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],   // line #14
  ['R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],   // line #15
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'],   // line #16
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],   // line #18
];

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R2C8', 8),
  new Given('R4C5', 2),
  ...betweenLines.map(cells => new Between(...cells)),
];
