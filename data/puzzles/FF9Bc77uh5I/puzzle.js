// Title: ZL GW DA
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=FF9Bc77uh5I
// Source: https://sudokupad.app/ws3dy3a8gi

// Normal Sudoku rules apply (standard rows/columns/3x3 boxes).
//
// Green lines (German Whisper, default difference 5): adjacent digits along
// each green line must differ by at least 5.
//
// Black lines with hexagons at both ends are double arrows: the digits on
// each line sum to the same number as the sum of the digits in the two
// hexagons at the ends of that line. DoubleArrow(...) takes the two bulb
// cells first and last, with the line cells in between.
//
// Lavender (purple) lines are zippers: digits at equal distance from the
// centre of the line sum to the central value. All three drawn lavender
// lines have odd length, so each has a single centre cell.

return [
  new Shape('9x9'),

  // Green lines, drawn as two 3-cell strokes crossing at the shared centre
  // cell R5C5 (two separate drawn strokes that both touch R5C5, not one
  // path revisiting a cell).
  new Whisper('R4C4', 'R5C5', 'R4C5'),
  new Whisper('R4C6', 'R5C5', 'R5C6'),

  // Double arrows: hexagon bulbs at the ends of the black lines.
  new DoubleArrow('R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new DoubleArrow('R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'),
  new DoubleArrow('R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),

  // Lavender zipper lines.
  new Zipper(
    'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
    'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Zipper(
    'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
    'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Zipper('R7C1', 'R8C1', 'R9C2'),
];
