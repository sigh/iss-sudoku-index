// Title: Intersections
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=vKVJhPZRUOo
// Source: https://app.crackingthecryptic.com/or128b1uu1

// Normal Sudoku rules apply. Thermometers increase from bulb to tip. The blue
// loop has equal sums in each box segment, and the green loop is a German
// Whispers line. Listed X clues sum to 10; unmarked adjacent cells need not.
// Thermometer paths and X pairs are transcribed from the drawn clues.
return [
  new Shape('9x9'),
  new Thermo('R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'),
  new Thermo('R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'),
  new Thermo('R4C9', 'R4C8', 'R3C7', 'R2C6', 'R1C6'),
  new Thermo('R6C1', 'R6C2', 'R7C3', 'R8C4', 'R9C4'),
  new RegionSumLine('R3C6', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R6C3', 'R5C4', 'R4C5'),
  new Whisper(5, 'R4C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3'),
  new Whisper(5, 'R4C3', 'R5C4'),
  new X('R9C2', 'R9C1'),
  new X('R8C8', 'R9C8'),
  new X('R2C1', 'R1C1'),
  new X('R6C8', 'R6C9'),
  new X('R9C3', 'R9C4'),
];
