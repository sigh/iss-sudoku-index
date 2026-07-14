// Title: When All Else Fails
// Author: PhyDraLey
// Video: https://www.youtube.com/watch?v=jtrhahQlgQE
// Source: https://sudokupad.app/yva5yqfaam

// Normal sudoku rules apply.
//
// Thermometer (grey lines with a bulb circle): digits increase from bulb to
// tip.
// German whisper (green lines): adjacent digits differ by at least 5.
// Region sum line (blue line): box borders divide the line into segments
// that each sum to the same, unstated, total. RegionSumLine enforces that
// derived equal-sum property directly, without ever naming the total.
//
// "When all else fails" (place a 3 in the top-most row lacking a 3, in the
// left-most cell of that row that could hold a 3, whenever ordinary
// deduction is stuck) is a rule about the *state of a deductive solving
// process* -- not a property of the finished grid -- so it has no
// declarative ISS encoding. It is intentionally omitted below.

const thermos = [
  // bulb first, per the underlay circle on each line
  new Thermo('R2C4', 'R3C4', 'R4C4', 'R4C3', 'R5C3'),
  new Thermo('R7C7', 'R6C7', 'R6C6'),
  new Thermo('R4C8', 'R5C9'),
  new Thermo('R3C7', 'R3C6'),
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2'),
];

const whispers = [
  new Whisper(5, 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R6C2'),
  new Whisper(5, 'R2C6', 'R3C6', 'R4C5', 'R5C6'),
  new Whisper(5, 'R6C5', 'R7C6', 'R8C7'),
];

const regionSumLines = [
  new RegionSumLine('R2C7', 'R3C8', 'R4C7', 'R5C7', 'R4C6', 'R5C5'),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...whispers,
  ...regionSumLines,
];
