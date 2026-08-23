// Title: Winged Thermarrow
// Author: Jonathan Bost
// Video: https://www.youtube.com/watch?v=BemhDRPqhOU
// Source: https://app.crackingthecryptic.com/sudoku/br8fBj3d3p

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits along an
// arrow increase from the tip and sum to the number in the circle: each
// circle cell is the shared bulb of two arrows, so it is encoded once with
// Arrow (arm sums to the bulb) and each arm is additionally encoded with
// Thermo (strictly increasing, tip-first) to capture the "increase from the
// tip" clause. Arm cell order below is tip-first in both Arrow and Thermo so
// the two constraints per arm are easy to compare.
const arrows = [
  // Circle R1C9 (two arms)
  new Arrow('R1C9', 'R1C8', 'R2C9'),
  new Thermo('R1C8', 'R2C9'),
  new Arrow('R1C9', 'R1C7', 'R2C8'),
  new Thermo('R1C7', 'R2C8'),

  // Circle R2C4 (two arms)
  new Arrow('R2C4', 'R2C6', 'R1C5'),
  new Thermo('R2C6', 'R1C5'),
  new Arrow('R2C4', 'R2C3', 'R1C4'),
  new Thermo('R2C3', 'R1C4'),

  // Circle R4C4 (two arms)
  new Arrow('R4C4', 'R4C2', 'R3C3'),
  new Thermo('R4C2', 'R3C3'),
  new Arrow('R4C4', 'R5C4', 'R4C5'),
  new Thermo('R5C4', 'R4C5'),

  // Circle R5C1 (two arms)
  new Arrow('R5C1', 'R4C2', 'R5C2'),
  new Thermo('R4C2', 'R5C2'),
  new Arrow('R5C1', 'R6C2', 'R6C1'),
  new Thermo('R6C2', 'R6C1'),

  // Circle R7C2 (two arms)
  new Arrow('R7C2', 'R6C2', 'R6C3'),
  new Thermo('R6C2', 'R6C3'),
  new Arrow('R7C2', 'R8C2', 'R8C1'),
  new Thermo('R8C2', 'R8C1'),

  // Circle R9C3 (two arms)
  new Arrow('R9C3', 'R8C2', 'R9C2'),
  new Thermo('R8C2', 'R9C2'),
  new Arrow('R9C3', 'R7C3', 'R8C3'),
  new Thermo('R7C3', 'R8C3'),

  // Circle R7C4 (two arms; one arm's tip R8C5 is shared with an R7C6 arm's
  // tip below -- the two arrow tips meet at the same cell without R8C5
  // itself being a circle)
  new Arrow('R7C4', 'R8C5', 'R9C4', 'R8C4'),
  new Thermo('R8C5', 'R9C4', 'R8C4'),
  new Arrow('R7C4', 'R5C5', 'R6C4'),
  new Thermo('R5C5', 'R6C4'),

  // Circle R5C7 (two arms)
  new Arrow('R5C7', 'R6C5', 'R5C6'),
  new Thermo('R6C5', 'R5C6'),
  new Arrow('R5C7', 'R3C6', 'R3C7', 'R4C6'),
  new Thermo('R3C6', 'R3C7', 'R4C6'),

  // Circle R7C6 (two arms; shares tip R8C5 with an R7C4 arm above)
  new Arrow('R7C6', 'R8C5', 'R9C6', 'R8C6'),
  new Thermo('R8C5', 'R9C6', 'R8C6'),
  new Arrow('R7C6', 'R7C7', 'R6C7'),
  new Thermo('R7C7', 'R6C7'),

  // Circle R9C8 (two arms)
  new Arrow('R9C8', 'R9C6', 'R9C7'),
  new Thermo('R9C6', 'R9C7'),
  new Arrow('R9C8', 'R7C9', 'R8C8'),
  new Thermo('R7C9', 'R8C8'),

  // Circle R4C9 (two arms)
  new Arrow('R4C9', 'R5C8', 'R5C9'),
  new Thermo('R5C8', 'R5C9'),
  new Arrow('R4C9', 'R4C7', 'R4C8'),
  new Thermo('R4C7', 'R4C8'),
];

// "AGE" cage (R2C1,R2C2): drawn with no numeric total -- its label states it
// shows the constructor's age, which is not a value the payload carries.
// A no-total killer cage still imposes all-different on its cells.
const cages = [
  new AllDifferent('R2C1', 'R2C2'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...cages,
];
