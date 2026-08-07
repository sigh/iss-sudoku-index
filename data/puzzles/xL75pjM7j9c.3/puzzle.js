// Title: A Real Humanmade Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=xL75pjM7j9c
// Source: https://tinyurl.com/3v62n4fk

// Normal sudoku rules (default 9 boxes; no `region` overrides in the payload).
// Ten thermometers: digits strictly increase from the bulb (first cell below)
// to the tip. Eight of the ten thermometers' cell sets are also killer cages
// (sum to the given total, no repeats within the cage); the other two
// (the R3C1.. and R3C8.. six-cell thermometers) carry no cage. No given digits.

return [
  new Shape('9x9'),

  // Thermometers, bulb-first, transcribed from the drawn lines.
  new Thermo('R4C4', 'R3C4', 'R3C3'),
  new Thermo('R2C4', 'R2C3', 'R2C2'),
  new Thermo('R1C4', 'R1C3', 'R1C2', 'R1C1'),
  new Thermo('R9C9', 'R9C8', 'R9C7', 'R9C6'),
  new Thermo('R8C8', 'R8C7', 'R8C6'),
  new Thermo('R7C7', 'R7C6', 'R6C6'),
  new Thermo('R9C2', 'R9C3', 'R9C4', 'R8C4'),
  new Thermo('R2C6', 'R1C6', 'R1C7', 'R1C8'),
  new Thermo('R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2'),
  new Thermo('R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),

  // Killer cages, transcribed from the drawn cage outlines. Each cage's cell
  // set matches one of the thermometers above (all but the two 6-cell ones).
  new Cage(10, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(29, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(13, 'R2C2', 'R2C3', 'R2C4'),
  new Cage(14, 'R3C3', 'R3C4', 'R4C4'),
  new Cage(18, 'R8C6', 'R8C7', 'R8C8'),
  new Cage(14, 'R6C6', 'R7C6', 'R7C7'),
  new Cage(19, 'R8C4', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(23, 'R1C6', 'R1C7', 'R1C8', 'R2C6'),
];
