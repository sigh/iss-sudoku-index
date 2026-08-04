// Title: Das Boot
// Author: Dying Flutchman, Mr.Menace & PjotrV
// Video: https://www.youtube.com/watch?v=klY26mjzihE
// Source: https://app.crackingthecryptic.com/sudoku/tFThnGBNTR
//
// Normal sudoku (standard 3x3 boxes, no givens). Two families of lines,
// distinguished by drawn colour: "orange" lines (adjacent cells differ by
// >= 4) and "green" lines (adjacent cells differ by >= 5). The payload only
// draws two line colours, #F7D038 (gold/amber) and #A3E048 (yellow-green);
// #F7D038's hue sits close to orange and #A3E048's close to green, so that
// is the colour->word mapping used below. One killer cage sums to 18; its
// three cells coincide with one of the orange lines.
// Each drawn line is kept as its own Whisper group, even where two lines of
// the same colour touch at a shared cell (a branch point) -- the payload
// lists them as separate polyline entries, not one path.

return [
  new Shape('9x9'),

  new Cage(18, 'R5C4', 'R6C4', 'R6C5'),

  // Orange lines: adjacent difference >= 4.
  new Whisper(4, 'R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C8'),
  new Whisper(4, 'R5C6', 'R4C7', 'R5C8', 'R6C7'),
  new Whisper(4, 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Whisper(4, 'R2C5', 'R3C6'),
  new Whisper(4, 'R7C6', 'R8C5'),
  new Whisper(4, 'R5C4', 'R6C5', 'R6C4'),
  new Whisper(4, 'R6C2', 'R7C3', 'R8C4'),
  new Whisper(4, 'R8C2', 'R7C3'),

  // Green lines: adjacent difference >= 5.
  new Whisper(5, 'R1C2', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new Whisper(5, 'R5C1', 'R5C2', 'R5C3'),
  new Whisper(5, 'R1C7', 'R2C7', 'R3C7'),
  new Whisper(5, 'R8C7', 'R8C6', 'R9C6', 'R9C7'),
];
