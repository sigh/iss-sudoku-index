// Title: Framed
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=-MQieDTAW0Q
// Source: https://app.crackingthecryptic.com/sudoku/9FbLfG9h2M

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Circles: the listed digits each appear at least once among the four
// surrounding cells -> Quad(topLeftCell, ...values).
// Green lines: adjacent digits differ by at least 5 -> Whisper(5, ...cells).
// Orange lines: every 3 sequential cells hold one low (1-3), one mid (4-6)
// and one high (7-9) digit -> Entropic(...cells).
// Purple lines: digits form a non-repeating consecutive set, any order
// -> Renban(...cells).
//
// A third green-line entry exists in the payload (colour + thickness only,
// no wayPoints) and draws nothing on the board, so it is not encoded.

const quads = [
  new Quad('R2C2', 3, 6, 8),
  new Quad('R7C2', 7),
  new Quad('R7C7', 7, 8),
  new Quad('R2C7', 3, 8),
  new Quad('R3C6', 1, 9),
  new Quad('R3C3', 9),
  new Quad('R6C3', 2, 9),
  new Quad('R6C6', 4),
];

const renbanLines = [
  new Renban('R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Renban('R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'),
  new Renban('R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
];

const entropicLines = [
  new Entropic('R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Entropic('R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4'),
  new Entropic('R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6'),
];

const whisperLines = [
  new Whisper(5, 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6'),
  new Whisper(5, 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  ...quads,
  ...renbanLines,
  ...entropicLines,
  ...whisperLines,
];
