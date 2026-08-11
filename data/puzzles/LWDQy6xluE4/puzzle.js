// Title: Rorschach
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=LWDQy6xluE4
// Source: https://app.crackingthecryptic.com/sudoku/fdDbLNnmqj

// Normal sudoku rules apply (default Shape/AllDifferent rows, columns, boxes;
// no givens). Along each thermometer, digits must increase from the bulb end
// -- Thermo(...) enforces strictly increasing values starting at its first
// argument, which is passed bulb-first below.
//
// Each thermometer's cell sequence and its bulb-end circle are transcribed
// from the drawn grid; one array below per drawn thermometer.

return [
  new Shape('9x9'),

  new Thermo('R1C2', 'R1C3', 'R2C3', 'R2C4', 'R3C4'),
  new Thermo('R1C8', 'R1C7', 'R2C6', 'R3C6', 'R4C6'),
  new Thermo('R3C8', 'R4C7', 'R5C6'),
  new Thermo('R3C1', 'R4C2', 'R4C3'),
  new Thermo('R7C2', 'R6C3', 'R5C4'),
  new Thermo('R7C9', 'R6C8', 'R6C7'),
  new Thermo('R9C8', 'R9C7', 'R8C7', 'R8C6', 'R7C6'),
  new Thermo('R9C2', 'R9C3', 'R8C3', 'R8C4', 'R7C4'),
];
