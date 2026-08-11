// Title: Atom
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=5p51R3kOovQ
// Source: https://app.crackingthecryptic.com/sudoku/T2D67FnRDM

// Normal sudoku. Between's own DESCRIPTION ("Values on the line must be
// strictly between the values in the circles") is exactly the rules
// sentence, so every grey line below is a Between over [end circle, ...mid
// cells..., end circle]. Nothing is omitted: 15 grey lines are drawn,
// joining 9 circles -- one centre circle plus 8 arranged around it -- and
// all 15 are listed here. Only 7 of the 8 possible centre-to-ring spokes
// are drawn (no centre<->NE line exists); that asymmetry is drawn, not an
// omission.
const GIVENS = [
  ['R1C8', 2], ['R2C2', 7], ['R4C7', 1], ['R6C4', 8],
];

// Spokes: centre circle (R5C5) to each ring circle.
const SPOKES = [
  ['R5C5', 'R4C5', 'R3C5', 'R2C5'], // centre-N
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'], // centre-S
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'], // centre-E
  ['R5C5', 'R5C4', 'R5C3', 'R5C2'], // centre-W
  ['R5C5', 'R4C4', 'R3C3'],         // centre-NW
  ['R5C5', 'R6C6', 'R7C7'],         // centre-SE
  ['R5C5', 'R6C4', 'R7C3'],         // centre-SW
];

// Ring: each ring circle to its two ring neighbours.
const RING = [
  ['R2C5', 'R2C4', 'R3C3'], // N-NW
  ['R5C2', 'R4C2', 'R3C3'], // W-NW
  ['R5C2', 'R6C2', 'R7C3'], // W-SW
  ['R2C5', 'R2C6', 'R3C7'], // N-NE
  ['R5C8', 'R4C8', 'R3C7'], // E-NE
  ['R5C8', 'R6C8', 'R7C7'], // E-SE
  ['R8C5', 'R8C6', 'R7C7'], // S-SE
  ['R8C5', 'R8C4', 'R7C3'], // S-SW
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  ...SPOKES.map(cells => new Between(...cells)),
  ...RING.map(cells => new Between(...cells)),
];
