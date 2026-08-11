// Title: 1001 Lines
// Author: Jakhob & Wooferzfg
// Video: https://www.youtube.com/watch?v=ELuBEk4K10I
// Source: https://app.crackingthecryptic.com/sudoku/FqmjrbhHf4

// Rules encoded here:
//   Irregular Sudoku - 1-9 once each in every row, column and outlined
//     (jigsaw) region -> NoBoxes + Jigsaw per region.
//   Green lines: neighbouring digits differ by at least 5
//     -> Whisper(5, ...cells).
//   Purple lines: digits form a non-repeating consecutive set, any order
//     -> Renban(...cells).
// One given digit: R6C1=1. Nothing is omitted.

// The nine outlined regions, transcribed from the drawn region borders.
const REGIONS = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R3C3', 'R4C2', 'R2C4'],
  ['R4C1', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R3C1'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R8C5', 'R8C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R1C3'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R4C7', 'R4C8', 'R3C8'],
  ['R8C6', 'R9C4', 'R9C5', 'R9C6', 'R9C2', 'R9C3', 'R9C7', 'R8C7', 'R9C8'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C9', 'R4C9'],
  ['R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C9', 'R6C8', 'R5C8', 'R5C9', 'R6C9'],
];

// Green lines, transcribed from the drawn stroke geometry (colour #A3E048).
const whisperLines = [
  new Whisper(5, 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'),
  new Whisper(5, 'R3C3', 'R2C4'),
  new Whisper(5, 'R5C4', 'R6C5'),
  new Whisper(5, 'R5C7', 'R5C8'),
  new Whisper(5, 'R6C9', 'R7C9'),
];

// Purple lines, transcribed from the drawn stroke geometry (colour
// #D23BE7). The line R1C3-R2C3-R2C2-R3C2-R3C1 shares only its two
// endpoints with the green line above (R1C3-R1C2-R1C1-R2C1-R3C1); each is
// drawn as its own distinct stroke, so they are two separate clues, not one.
const renbanLines = [
  new Renban('R8C3', 'R8C4'),
  new Renban('R4C6', 'R4C5', 'R4C4', 'R3C4', 'R3C5'),
  new Renban('R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1'),
  new Renban('R4C1', 'R4C2', 'R4C3', 'R3C3'),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new Given('R6C1', 1),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  ...whisperLines,
  ...renbanLines,
];
