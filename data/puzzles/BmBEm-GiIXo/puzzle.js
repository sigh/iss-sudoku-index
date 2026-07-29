// Title: A Few Glasses O' Bubbly
// Author: HalfBakedLunatic
// Video: https://www.youtube.com/watch?v=BmBEm-GiIXo
// Source: https://app.crackingthecryptic.com/3a0z38vzgq

// Green and orange champagne flutes are branching paths; each visible arm is
// constrained from the shared bowl/stem junction.
const greenBowl = ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9'];
const greenStem = ['R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'];
const orangeLeft = ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C1', 'R3C1', 'R2C1', 'R1C1'];
const orangeRight = ['R5C2', 'R4C3', 'R3C3', 'R2C3', 'R1C3'];
const purpleBases = [
  ['R9C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9'],
];
const bubbles = [
  ['R1C7', 'R1C8'], ['R2C8', 'R2C9'], ['R4C2', 'R5C2'],
  ['R2C1', 'R2C2'], ['R3C5', 'R4C5'], ['R1C4', 'R1C5'],
  ['R2C8', 'R3C8'], ['R1C2', 'R1C3'], ['R3C4', 'R3C5'],
  ['R2C2', 'R2C3'], ['R4C8', 'R5C8'], ['R2C6', 'R3C6'],
  ['R2C4', 'R2C5'],
];
const quads = [
  ['R5C3', [1, 5, 6, 9]],
  ['R5C6', [1, 3, 7, 8]],
  ['R8C3', [3, 4, 7, 8]],
  ['R8C6', [2, 2, 5, 6]],
];

return [
  new Shape('9x9'),
  new Whisper(5, ...greenBowl),
  new Whisper(5, ...greenStem),
  new Whisper(4, ...orangeLeft),
  new Whisper(4, ...orangeRight),
  // Box borders split the blue flute into the four shown equal-sum sections.
  new EqualSum(
    ['R1C4', 'R2C4', 'R3C4'],
    ['R1C6', 'R2C6', 'R3C6'],
    ['R4C4', 'R5C5', 'R4C6', 'R6C5'],
    ['R7C5', 'R8C5', 'R9C5'],
  ),
  ...purpleBases.map(cells => new Renban(...cells)),
  ...bubbles.map(cells => new WhiteDot(...cells)),
  ...quads.map(([topLeft, digits]) => new Quad(topLeft, ...digits)),
];
