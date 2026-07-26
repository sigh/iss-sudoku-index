// Title: For Steph
// Author: Dan From "WOP-in-jers"
// Video: https://www.youtube.com/watch?v=PMNAQTKArTk
// Source: https://sudokupad.app/h3i7jv9pqj

// Standard Sudoku (rows, columns, boxes). Two grey thermometers increase from
// the bulb. Two grey arrows: the arm sums to the circled cell; repeats on the
// arm are allowed and need no extra encoding since Arrow does not impose
// all-different on the arm. Three purple lines are Renban (the line's cells
// hold a consecutive set of digits in any order) -- the third is drawn as a
// closed loop, but Renban binds the cell set, not sequential pairs, so the
// loop needs no repeated closing cell. Three green segments require adjacent
// digits to differ by >= 5 (Whisper); two of them share cell R4C8 as a branch
// point and are kept as separate Whisper calls so only the drawn adjacent
// pairs are constrained. Fog (reveal-on-solve) is solving UI, not a grid
// rule, and is omitted.

return [
  new Shape('9x9'),

  new Given('R2C2', 6),
  new Given('R3C4', 7),
  new Given('R4C8', 9),
  new Given('R5C1', 5),
  new Given('R5C4', 4),
  new Given('R5C5', 8),
  new Given('R5C6', 2),
  new Given('R6C2', 3),
  new Given('R8C6', 4),

  // Thermometers: bulb first, strictly increasing to the tip.
  new Thermo('R8C2', 'R7C2', 'R6C2', 'R7C3', 'R6C4', 'R7C4', 'R8C4'),
  new Thermo('R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'),

  // Arrows: circle cell first, then the arm cells that must sum to it.
  new Arrow('R5C4', 'R4C4', 'R4C3', 'R5C3'),
  new Arrow('R8C6', 'R9C6', 'R9C7'),

  // Purple Renban lines.
  new Renban('R3C6', 'R3C5', 'R4C5', 'R5C5'),
  new Renban('R4C7', 'R4C6', 'R5C6', 'R6C6'),
  new Renban('R7C7', 'R8C7', 'R8C6', 'R7C6'),

  // Green difference lines, difference >= 5. Lines 6 and 7 from the source
  // payload share R4C8 and are kept separate so only the drawn pairs
  // (R3C7-R4C8, R4C8-R5C8, R4C8-R3C9) are constrained, not R3C7-R3C9.
  new Whisper(5, 'R4C3', 'R3C4', 'R4C4'),
  new Whisper(5, 'R3C7', 'R4C8', 'R5C8'),
  new Whisper(5, 'R4C8', 'R3C9'),
];
