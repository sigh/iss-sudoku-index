// Title: Thermo Dynamics
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=Zhf6DTdiKdM
// Source: https://app.crackingthecryptic.com/sudoku/rm4H3mggT7

// Normal sudoku (9x9, standard boxes, no givens). Thermometers increase
// strictly from the bulb. Black dots are a 2:1 ratio, white dots are
// consecutive; "not all dots are shown" means no negative Kropki inference
// is drawn from undotted adjacent pairs, so only the drawn dots are
// encoded. Anti-knight is a global constraint.

// Two of the drawn line strokes both originate at R1C1 and only R1C1 has a
// bulb circle drawn on it, so this is one bulb forking into two increasing
// arms, not two independent thermometers.
const thermometers = [
  new Thermo('R1C1', 'R1C2', 'R1C3'),
  new Thermo('R1C1', 'R2C1', 'R3C1'),
  new Thermo('R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new Thermo('R1C7', 'R2C8', 'R3C9'),
  new Thermo('R7C1', 'R8C2', 'R9C3'),
];

const whiteDots = [
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R5C7', 'R5C8'),
  new WhiteDot('R5C8', 'R5C9'),
];

const blackDots = [
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R5C2', 'R5C3'),
];

return [
  new Shape('9x9'),
  ...thermometers,
  ...whiteDots,
  ...blackDots,
  new AntiKnight(),
];
