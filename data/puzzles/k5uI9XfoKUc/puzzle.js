// Title: Consecutive Ladder
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=k5uI9XfoKUc
// Source: https://app.crackingthecryptic.com/sudoku/7G22jmGTqP

// Normal sudoku rules apply (rows, columns, boxes; regions are the ordinary
// 3x3 boxes). Along thermometers, digits increase from the bulb end
// (Thermo's first argument). Each purple line holds a set of non-repeating
// consecutive digits in any order (Renban).
//
// One more purple-coloured line entry is present in the source with no
// drawn waypoints at all -- no cells are recoverable for it, so it is
// omitted here.

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R4C9', 1),
  new Given('R8C9', 3),

  // Thermometers: bulb cell first, increasing from the bulb.
  new Thermo('R2C3', 'R1C4'),
  new Thermo('R7C4', 'R7C3'),
  new Thermo('R9C4', 'R8C4'),

  // Purple consecutive-set lines (Renban): order within each line does not
  // matter to the constraint, cell lists follow the drawn path.
  new Renban('R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Renban('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Renban('R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Renban('R5C3', 'R5C4', 'R5C5', 'R5C6', 'R4C6'),
  new Renban('R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new Renban('R7C2', 'R7C3', 'R7C4', 'R7C5'),
  new Renban('R8C2', 'R8C3', 'R8C4', 'R8C5'),
  new Renban('R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new Renban('R8C7', 'R7C7', 'R6C7', 'R6C8'),
  new Renban('R3C7', 'R4C7', 'R4C8'),
  new Renban('R1C8', 'R2C9'),
];
