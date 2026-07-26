// Title: Read between the cages
// Author: shady moon
// Video: https://www.youtube.com/watch?v=sDeR9rmjEj8
// Source: https://sudokupad.app/xyrh6tfdyq

// Normal sudoku rules apply (rows, columns, boxes). Four 3x3 "window" cages
// (offset from the standard boxes) require all-different digits with no
// stated total. Two thermometers increase from the bulb (first cell). Nine
// lines are drawn with a circle at each end; digits on a line are strictly
// between the two circle values, and the rules add that the line also acts
// as a thermometer, increasing from the "low" circle to the "high" circle.
// The source does not mark which end of each of these nine lines is the low
// circle (no distinguishing size, colour, or style between the two ends is
// present in the puzzle data), so the fixed direction is not recoverable.
// What is recoverable is that each line is monotonic in one direction or the
// other: encoded below as a disjunction of the two possible Thermos per
// line, which also implies the strict-between bound (a value strictly
// between the two endpoints is exactly what a monotonic run between them
// produces), so no separate Between constraint is needed. Omission: the
// specific low/high orientation of each of the nine lines is unencoded.
function eitherDirectionThermo(...cells) {
  return new Or([new Thermo(...cells), new Thermo(...cells.slice().reverse())]);
}

return [
  new Shape('9x9'),

  // Four windowed cages, no total: all-different only.
  new AllDifferent('R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'),
  new AllDifferent('R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'),
  new AllDifferent('R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'),
  new AllDifferent('R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),

  // Two thermometers, bulb = first cell listed.
  new Thermo('R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Thermo('R8C1', 'R7C1', 'R6C1', 'R5C1'),

  // Nine between/thermo lines, direction unresolved -- see note above.
  eitherDirectionThermo('R1C1', 'R1C2', 'R1C3', 'R1C4'),
  eitherDirectionThermo('R1C6', 'R1C7', 'R1C8', 'R1C9'),
  eitherDirectionThermo('R1C6', 'R1C5', 'R1C4'),
  eitherDirectionThermo('R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  eitherDirectionThermo('R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9'),
  eitherDirectionThermo('R4C9', 'R3C9', 'R2C9', 'R1C9'),
  eitherDirectionThermo('R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),
  eitherDirectionThermo('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  eitherDirectionThermo('R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'),
];
