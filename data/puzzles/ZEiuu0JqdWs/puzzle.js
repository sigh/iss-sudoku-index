// Title: Honk!
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=ZEiuu0JqdWs
// Source: https://app.crackingthecryptic.com/sudoku/NDGPQF2DBM

// Normal sudoku rules apply. Digits on a purple line form a set of
// consecutive, non-repeating digits in any order (Renban). Along
// thermometers, digits must increase from the bulb end (Thermo). Adjacent
// digits on a green line must differ by at least 5 (Whisper).
//
// The four thermometers are each Y-shaped: a bulb, a shared stem cell, then
// two arms increasing away from the bulb. Encoded as two overlapping Thermo
// calls per fork, sharing the bulb+stem prefix -- each enforces the increase
// along one arm.

const whisperLine = [
  'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6', 'R7C5', 'R6C4',
];

const thermos = [
  // [bulb, stem, arm1, arm2]
  ['R2C2', 'R3C3', 'R4C3', 'R3C4'],
  ['R2C8', 'R3C7', 'R3C6', 'R4C7'],
  ['R8C8', 'R7C7', 'R6C7', 'R7C6'],
  ['R8C2', 'R7C3', 'R6C3', 'R7C4'],
].flatMap(([bulb, stem, arm1, arm2]) => [
  new Thermo(bulb, stem, arm1),
  new Thermo(bulb, stem, arm2),
]);

const renbans = [
  ['R1C1', 'R2C2', 'R1C3'],
  ['R1C9', 'R2C8', 'R3C9'],
  ['R9C8', 'R8C8', 'R8C9'],
  ['R7C1', 'R8C2', 'R9C1'],
].map((cells) => new Renban(...cells));

return [
  new Shape('9x9'),
  new Whisper(5, ...whisperLine),
  ...thermos,
  ...renbans,
];
