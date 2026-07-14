// Title: Sting in the Tail
// Author: Timotab
// Video: https://www.youtube.com/watch?v=yK1Qk7e-OKA
// Source: https://sudokupad.app/6og3rrs1zc

// Six green German Whisper lines: adjacent cells must differ by at least 5
// (the default difference, matching the rules text exactly).
const whispers = [
  new Whisper(5, 'R2C9', 'R2C8', 'R2C7', 'R2C6', 'R1C5', 'R1C4', 'R2C3', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R3C2'),
  new Whisper(5, 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6', 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R6C9', 'R7C8'),
  new Whisper(5, 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C8', 'R4C7', 'R5C6', 'R6C6', 'R6C5', 'R7C5'),
  new Whisper(5, 'R7C4', 'R7C3', 'R7C2', 'R7C1', 'R6C2', 'R6C3', 'R5C4', 'R4C4', 'R4C5', 'R3C5'),
  new Whisper(5, 'R5C9', 'R5C8', 'R6C7'),
  new Whisper(5, 'R5C1', 'R5C2', 'R4C3'),
];

// Hidden two-cell sum markers ("IX" -> 9, "XI" -> 11); drawn with no visible
// cage border, but the payload's own hidden cages carry the same cells and
// totals as the IX/XI overlay badges, and the cage's `unique` flag is
// consistent with the rule (two distinct digits summing to an odd total can
// never be equal anyway).
const sumPairs = [
  new Cage(9, 'R2C4', 'R2C5'),
  new Cage(11, 'R8C5', 'R8C6'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...sumPairs,
];
