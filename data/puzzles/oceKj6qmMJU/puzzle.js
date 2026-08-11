// Title: Vikna (Windows)
// Author: Yarr
// Video: https://www.youtube.com/watch?v=oceKj6qmMJU
// Source: https://app.crackingthecryptic.com/sudoku/4M6M7GnBtM

// Rules (metadata.rules): "1-9 appear in each row, column and region.
// Identical digits cannot be a knight's move apart. Along thermometers,
// digits increase from the bulb. Grey squares are even digits. Adjacent
// digits on a green line must have a difference of 5 or more. Orange lines
// join identical digits."
//
// The 9 regions are irregular (not the default boxes), so the box group is
// dropped (NoBoxes) and replaced with one Jigsaw per region.
//
// Four of the drawn strokes are two orange segments either side of one
// green segment, forming a single path through the centre cross region.
// Each orange segment (2 cells) is encoded as its own equal-value pair;
// each green segment (2 cells) as its own difference-of-5-or-more pair.
// This keeps every segment's own colour rule local, rather than asserting
// one relation for the whole 4-cell path.

const regions = [
  // Drawn irregular regions, transcribed as R#C# lists.
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R6C1', 'R7C1'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C5', 'R2C9'],
  ['R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
  ['R8C1', 'R8C5', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R3C9', 'R4C9', 'R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];

// Grey squares (8 cells): "Grey squares are even digits" -- encoded as a
// Given restricted to the even values.
const evenCells = [
  'R3C3', 'R3C5', 'R3C7', 'R5C7', 'R7C7', 'R7C5', 'R7C3', 'R5C3',
];

// Thermometers (grey, bulb confirmed by the coincident circle overlay at
// the first cell): "digits increase from the bulb".
const thermos = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R2C9', 'R1C9', 'R1C8'],
];

// Orange segments (colour #EB7532, 2 cells each): "Orange lines join
// identical digits".
const orangePairs = [
  ['R2C4', 'R3C5'],
  ['R4C3', 'R5C4'],
  ['R5C3', 'R6C2'],
  ['R6C5', 'R7C4'],
  ['R7C5', 'R8C6'],
  ['R5C6', 'R6C7'],
  ['R5C7', 'R4C8'],
  ['R4C5', 'R3C6'],
];

// Green segments (colour #A3E048, 2 cells each): "Adjacent digits on a
// green line must have a difference of 5 or more" -- Whisper's default
// difference is 5, matching the rule exactly.
const greenPairs = [
  ['R3C5', 'R4C5'],
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
  ['R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  new AntiKnight(),
  ...thermos.map(cells => new Thermo(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...orangePairs.map(cells => new SameValues(2, ...cells)),
  ...greenPairs.map(cells => new Whisper(...cells)),
];
