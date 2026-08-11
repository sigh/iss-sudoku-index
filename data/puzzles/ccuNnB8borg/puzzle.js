// Title: Remanence
// Author: Emphyrio
// Video: https://www.youtube.com/watch?v=ccuNnB8borg
// Source: https://app.crackingthecryptic.com/sudoku/d2LgFB96QP

// Normal sudoku rules apply (standard 3x3 box regions, no non-standard shape
// -- Shape('9x9') supplies rows/columns/boxes). No given digits.
// Digits along an arrow sum to the digit in the attached circle. Every
// circle overlay sits on a grid cell that is itself the first cell of one or
// more arrow paths (each arrow's drawn line originates at a circled cell),
// so the circle is not a separate clue cell: it is the bulb, encoded as the
// Arrow's first ("sum") cell per Arrow's ISS semantics (sum of cells[1:]
// equals the digit in cells[0]). Several bulb cells anchor more than one
// arrow with different arms; ISS's Arrow class has no UNIQUENESS_KEY_FIELD,
// so every instance at a shared bulb is kept.

return [
  new Shape('9x9'),

  // Bulb R3C3 -- 5 arrows.
  new Arrow('R3C3', 'R2C2', 'R1C2'),
  new Arrow('R3C3', 'R2C3', 'R1C3'),
  new Arrow('R3C3', 'R2C4', 'R1C4'),
  new Arrow('R3C3', 'R3C2', 'R3C1'),
  new Arrow('R3C3', 'R4C2', 'R4C1'),

  // Bulb R2C5 -- 1 arrow.
  new Arrow('R2C5', 'R3C5', 'R4C5'),

  // Bulb R3C7 -- 5 arrows.
  new Arrow('R3C7', 'R2C6', 'R1C6'),
  new Arrow('R3C7', 'R2C7', 'R1C7'),
  new Arrow('R3C7', 'R2C8', 'R2C9'),
  new Arrow('R3C7', 'R3C8', 'R3C9'),
  new Arrow('R3C7', 'R4C8', 'R4C9'),

  // Bulb R5C2 -- 1 arrow.
  new Arrow('R5C2', 'R5C3', 'R5C4'),

  // Bulb R7C3 -- 5 arrows.
  new Arrow('R7C3', 'R6C2', 'R6C1'),
  new Arrow('R7C3', 'R7C2', 'R7C1'),
  new Arrow('R7C3', 'R8C2', 'R8C1'),
  new Arrow('R7C3', 'R8C3', 'R9C3'),
  new Arrow('R7C3', 'R8C4', 'R9C4'),

  // Bulb R7C7 -- 4 arrows.
  new Arrow('R7C7', 'R8C7', 'R9C7'),
  new Arrow('R7C7', 'R7C8', 'R7C9'),
  new Arrow('R7C7', 'R6C8', 'R6C9'),
  new Arrow('R7C7', 'R8C6', 'R9C6'),

  // Bulb R5C8 -- 1 arrow.
  new Arrow('R5C8', 'R5C7', 'R6C7'),

  // Bulb R8C5 -- 1 arrow.
  new Arrow('R8C5', 'R7C5', 'R6C5'),
];
