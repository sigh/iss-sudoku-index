// Sulla Via Della Gloria by Playmaker6174
// https://sudokupad.app/sxsm_Playmaker6174_fbf1f8c319ff831179e920620371dd86
// https://www.youtube.com/watch?v=xlk19YzgMCM
//
// Normal Sudoku. Blue diamond = even, red diamond = odd. Two yellow squares
// hold the same digit; the two yellow circles likewise. Thin gray arrows sum
// to their pink circle. The pink line between two pink circles sums to the two
// circle digits (double arrow). Cages sum to their clue. Green line is a German
// whisper (adjacent difference >= 5). Box borders split the thick gray line
// into segments of equal sum (region sum line).

return [
  // Parity diamonds.
  new Given('R5C4', 2, 4, 6, 8),        // blue diamond: even
  new Given('R6C5', 1, 3, 5, 7, 9),     // red diamond: odd

  // Equal-value pairs.
  new SameValues(2, 'R9C1', 'R3C7'),    // yellow squares
  new SameValues(2, 'R5C1', 'R9C5'),    // yellow circles

  // Killer cages.
  new Cage(10, 'R1C2', 'R1C3'),
  new Cage(10, 'R7C9', 'R8C9'),
  new Cage(21, 'R4C5', 'R4C6', 'R5C6'),

  // Thin gray arrows (arm sums to the pink circle).
  new Arrow('R2C5', 'R2C4', 'R2C3', 'R2C2'),
  new Arrow('R5C8', 'R6C8', 'R7C8', 'R8C8'),

  // Pink line: the two endpoint circles sum to the digits between them.
  new DoubleArrow('R5C8', 'R4C7', 'R3C6', 'R2C5'),

  // Green German whisper line (adjacent difference >= 5).
  new Whisper('R2C7', 'R1C7', 'R2C8', 'R3C9', 'R3C8'),

  // Thick gray region sum line: equal sum in each box segment.
  new RegionSumLine(
    'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R7C3',
    'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7', 'R7C7'),
];
