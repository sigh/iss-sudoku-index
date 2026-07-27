// Title: Drunken Fish
// Author: Russian Singer
// Video: https://www.youtube.com/watch?v=wU7yNvGI1GM
// Source: https://sudokupad.app/rMGD6f9q8n

// Normal sudoku (rows, columns, boxes). Anti-king. Two killer cages (sum,
// no repeats). One thermometer, strictly increasing from the bulb. One
// German whisper line, drawn as two strokes sharing cell R9C5 -- encoded as
// two Whisper calls, one per drawn stroke, so the branch at R9C5 is
// preserved. Two black dots (1:2 ratio); not all such dot pairs are given.
//
// The payload also draws a short red line (R8C3-R8C4) and two red-outlined
// circles (R7C3, R7C4). The rules text says red markings can be ignored, so
// none of these are encoded.
//
// The grid has an underlaid "fog" reveal mechanic (payload underlays/cages
// tagged foglight) that only affects the UI as correct digits are placed;
// the rules text confirms it carries no extra constraint, so it is omitted.

const whisperMain = [
  'R8C8', 'R9C8', 'R9C7', 'R8C6', 'R9C5', 'R9C4', 'R9C3', 'R8C2',
  'R7C2', 'R6C3', 'R6C4', 'R5C5', 'R4C5', 'R3C6', 'R2C5',
];
const whisperBranch = ['R9C5', 'R8C5'];

const thermo = [
  'R3C4', 'R2C5', 'R2C6', 'R3C7', 'R4C6', 'R5C7', 'R6C7', 'R7C7', 'R8C6',
];

const cage36 = ['R2C4', 'R3C1', 'R3C2', 'R3C4', 'R4C2', 'R4C3', 'R4C4'];
const cage45 = [
  'R8C5', 'R8C6', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7',
];

return [
  new Shape('9x9'),
  new Given('R2C4', 9),
  new Given('R6C9', 5),
  new Given('R9C7', 3),

  new AntiKing(),

  new Cage(36, ...cage36),
  new Cage(45, ...cage45),

  new Thermo(...thermo),
  new Whisper(...whisperMain),
  new Whisper(...whisperBranch),

  new BlackDot('R7C6', 'R7C7'),
  new BlackDot('R6C6', 'R7C6'),

  // Underlaid parity markers: only one square (R9C9, "grey square" per the
  // rules text, rendered black in this payload) and one non-red circle
  // (R5C5) are present -- there is exactly one of each, matching the rules'
  // singular "the cell marked with a grey square". No native Odd/Even
  // class exists; encode as a candidate restriction.
  new Given('R9C9', 2, 4, 6, 8),
  new Given('R5C5', 1, 3, 5, 7, 9),
];
