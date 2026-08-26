// Title: Intricacies
// Author: zetamath
// Video: https://www.youtube.com/watch?v=Z2MwoWODfQs
// Source: https://sudokupad.app/yavvjksg60
//
// Normal sudoku rules. Green lines are German Whispers: Whisper(5, ...) on
// each line, encoded per drawn stroke (ten separate green strokes; two of
// them meet at R4C4 as a branch rather than a single chain, so both are kept
// as their own Whisper covering the edges they carry). Arrows: Arrow(bulb,
// ...arm) - the circled bulb cell equals the sum of the remaining arm cells.

const whispers = [
  ['R3C1', 'R4C1'],
  ['R3C2', 'R4C2'],
  ['R2C3', 'R2C4'],
  ['R1C3', 'R1C4'],
  ['R3C4', 'R3C3', 'R4C3'],
  ['R5C4', 'R4C4', 'R5C5'],
  ['R4C4', 'R4C5'],
  ['R3C5', 'R4C6', 'R4C7'],
  ['R6C1', 'R7C2', 'R8C2'],
  ['R9C8', 'R8C9', 'R7C9'],
].map((cells) => new Whisper(5, ...cells));

const arrows = [
  ['R7C6', 'R6C5', 'R6C4'],
  ['R2C9', 'R2C8', 'R2C7'],
  ['R8C8', 'R9C7', 'R9C6'],
  ['R7C7', 'R6C8', 'R6C9'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
].map((cells) => new Arrow(...cells));

return [new Shape('9x9'), ...whispers, ...arrows];
