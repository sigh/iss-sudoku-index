// Title: 12 Arrows
// Author: 12tone
// Video: https://www.youtube.com/watch?v=2102poUZPhY
// Source: https://app.crackingthecryptic.com/sudoku/tMBgMdtJQF

// Standard 9x9 sudoku, no givens. Twelve arrows: arm cells sum to the
// circle (bulb) digit, bulb cell listed first below.
// Two arrows meet at R7C7 (one's arm passes through it, the other's bulb
// sits there); the source colours the pass-through arrow differently
// purely so the two can be told apart at that shared cell -- the rules'
// note that this colouring "is cosmetic" adds no constraint, so both are
// encoded as ordinary arrows.
const arrows = [
  ['R1C2', 'R1C3', 'R2C2'],
  ['R1C6', 'R1C7', 'R2C8', 'R3C9'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R3C8', 'R4C9', 'R4C8', 'R5C7'],
  ['R3C3', 'R4C4'],
  ['R6C1', 'R6C2', 'R5C2', 'R4C3'],
  ['R6C3', 'R5C4', 'R4C5'],
  ['R6C4', 'R5C5', 'R4C6'],
  ['R7C3', 'R8C3', 'R9C2', 'R9C3', 'R9C4', 'R8C5'],
  ['R7C4', 'R6C5', 'R5C6'],
  ['R6C8', 'R7C7', 'R7C6'],
  ['R7C7', 'R6C6'],
];

return [
  new Shape('9x9'),

  ...arrows.map(([bulb, ...arm]) => new Arrow(bulb, ...arm)),
];
