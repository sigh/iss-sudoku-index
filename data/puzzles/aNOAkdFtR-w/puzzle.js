// Title: Dutch Whispers 4
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=aNOAkdFtR-w
// Source: https://app.crackingthecryptic.com/sudoku/R9Mb877pqm

// Normal sudoku rules (default rows/cols/boxes). Eleven grey "Dutch whisper"
// lines: neighbouring digits along a line differ by at least 4 (Whisper(4)).
//
// Whisper binds only consecutive pairs in its cell list, so each stroke below
// is transcribed exactly as drawn (walking waypoints vertex to vertex,
// expanding straight runs through every intermediate cell) even where a
// stroke closes back on an earlier cell of itself: the repeated cell just
// adds the extra pairwise edge that the closed shape draws, e.g. line A's
// list revisits R2C2 and R2C3 to encode its two loops sharing that edge.
// Two strokes that happen to meet at a shared cell (D/E in box 4, H/I in box
// 7) are kept as two Whisper calls, one per drawn stroke, since it is drawn
// as a branch, not one continuous polyline.

const givens = [
  ['R1C3', 6],
  ['R1C8', 9],
  ['R4C1', 7],
  ['R6C2', 9],
  ['R6C5', 6],
];

// Grey-line cell walks, transcribed from the drawn line waypoints.
const lineA = ['R2C2', 'R2C3', 'R3C3', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R2C3'];
const lineB = ['R1C6', 'R2C6', 'R3C6'];
const lineC = ['R1C9', 'R1C8', 'R2C8', 'R3C8', 'R3C9', 'R2C9', 'R2C8'];
const lineD = ['R4C2', 'R4C3', 'R5C3', 'R6C3', 'R6C2'];
const lineE = ['R5C2', 'R5C3'];
const lineF = ['R4C6', 'R4C5', 'R5C5', 'R5C6', 'R6C6', 'R6C5'];
const lineG = ['R4C8', 'R4C9', 'R5C9', 'R6C9'];
const lineH = ['R7C2', 'R8C2', 'R8C3'];
const lineI = ['R7C3', 'R8C3', 'R9C3'];
const lineJ = ['R9C5', 'R9C6', 'R8C6', 'R7C6', 'R7C5', 'R8C5', 'R8C6'];
const lineK = ['R7C8', 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C9'];

const lines = [
  lineA, lineB, lineC, lineD, lineE, lineF, lineG, lineH, lineI, lineJ, lineK,
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lines.map((cells) => new Whisper(4, ...cells)),
];
