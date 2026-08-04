// Title: Pincer
// Author: kuraban
// Video: https://www.youtube.com/watch?v=BF-881KyY88
// Source: https://app.crackingthecryptic.com/sudoku/FBFJ4jMdQd

// Normal sudoku rules apply. Along thermometers, digits must increase from
// the bulb end. Digits along an arrow must sum to the digit in that arrow's
// circle. The purple line contains a set of consecutive digits. Digits may
// not repeat along the marked diagonal.
//
// The two drawn thermometers are each a single bulb with two increasing
// arms branching from it (a "pincer"): each arm is encoded as its own
// Thermo starting at the shared bulb cell.

return [
  new Shape('9x9'),

  new Given('R8C3', 6),

  // Pincer 1, bulb R2C8, two increasing arms.
  new Thermo('R2C8', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4'),
  new Thermo('R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R6C8'),

  // Pincer 2, bulb R8C2, two increasing arms.
  new Thermo('R8C2', 'R8C1', 'R7C1', 'R6C1', 'R6C2'),
  new Thermo('R8C2', 'R9C2', 'R9C3', 'R9C4', 'R8C4'),

  // Arrow: bulb R1C1, arm R2C1-R3C1-R4C1.
  new Arrow('R1C1', 'R2C1', 'R3C1', 'R4C1'),

  // Purple line: consecutive digits, any order.
  new Renban('R9C5', 'R9C6', 'R9C7', 'R9C8'),

  // Marked diagonal R1C1-R9C9 (top-left to bottom-right): direction -1 is
  // the top-left-to-bottom-right diagonal in ISS's Diagonal convention.
  new Diagonal(-1),
];
