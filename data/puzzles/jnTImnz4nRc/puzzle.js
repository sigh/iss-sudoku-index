// Title: Slide Rule
// Author: Kuraban
// Video: https://www.youtube.com/watch?v=jnTImnz4nRc
// Source: https://app.crackingthecryptic.com/sudoku/TQGrL93NLJ

// Rules encoded: normal sudoku (default row/col/box all-different); identical
// digits cannot be a knight's move apart (AntiKnight, global); along thermos,
// digits strictly increase from the bulb (Thermo, bulb cell first); cages show
// their sums (Cage: distinct + sum).
//
// The three cells named "given digits ... shown as pencil-marks" in the rules
// text are encoded as ordinary Givens.
//
// Omitted: "After the puzzle is finished, erase all the digits apart from 1s,
// slide the 1s 3 cells to the right, or 6 cells to the left, and re-solve the
// puzzle ignoring the pencil-marks!" describes a second, separate puzzle
// played after this grid is solved. It does not constrain this grid's unique
// solution and no second clue set is available to reconstruct it.

return [
  new Shape('9x9'),

  // Three givens shown as pencil-marks in the original.
  new Given('R5C2', 5),
  new Given('R5C8', 7),
  new Given('R7C8', 5),

  new AntiKnight(),

  // Thermometers: bulb cell first, oriented by which endpoint carries the
  // rounded bulb-marker overlay drawn on the grid.
  new Thermo('R3C9', 'R4C8', 'R5C9', 'R6C9'),
  new Thermo('R2C7', 'R3C7'),
  new Thermo('R1C6', 'R2C6'),
  new Thermo('R2C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R4C6', 'R5C6'),
  new Thermo('R6C5', 'R6C4'),
  new Thermo('R7C5', 'R7C4'),
  new Thermo('R8C2', 'R8C1'),
  new Thermo('R8C4', 'R9C4'),
  new Thermo('R9C6', 'R9C7', 'R8C7'),

  // Cages.
  new Cage(6, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(11, 'R6C4', 'R6C5'),
  new Cage(10, 'R7C4', 'R7C5'),
  new Cage(8, 'R8C1', 'R8C2'),
  new Cage(13, 'R8C4', 'R9C4'),
  new Cage(18, 'R8C6', 'R8C7', 'R8C8'),
];
