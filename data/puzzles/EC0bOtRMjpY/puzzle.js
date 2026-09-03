// Title: Crimson Cut through the Green
// Author: NB
// Video: https://www.youtube.com/watch?v=EC0bOtRMjpY
// Source: https://sudokupad.app/hva096ojxs

// Normal 9x9 sudoku. Digits in a cage sum to the value shown in the cage's
// left-topmost cell. Adjacent digits on a green line differ by at least 5. On a
// grey line, any two neighbouring digits have the same difference. Digits on an
// arrow sum to the digit in that arrow's circle. Cells joined by an X sum to 10,
// by a white dot are consecutive, by a black dot are in a 1:2 ratio. Inequality
// signs point to the lower digit. The red line's rule is printed under the fog
// across R6C4: "region sum line / lowest possible value"; the minimality half
// of that caption is not encoded (see the red line below).
//
// Fog (cells revealed as correct digits are placed) is presentation only and is
// not encoded. Dots, Xs and inequality signs are not declared exhaustive, so no
// negative constraint applies to unmarked edges.

return [
  new Shape('9x9'),

  new Given('R5C5', 1),

  // Killer cages; each carries the payload's all-different flag.
  new Cage(18, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(18, 'R1C8', 'R2C8', 'R3C8'),
  new Cage(9, 'R7C2', 'R8C2'),
  new Cage(9, 'R7C8', 'R8C8'),
  new Cage(8, 'R9C5', 'R9C6'),

  // Green lines.
  new Whisper(5, 'R6C8', 'R7C8', 'R8C8'),
  new Whisper(5, 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R9C3'),
  new Whisper(5, 'R4C2', 'R3C2', 'R3C3'),
  new Whisper(5, 'R3C7', 'R3C8', 'R4C8'),
  new Whisper(5, 'R1C4', 'R1C3', 'R2C3'),

  // Grey line R5C6-R6C6-R7C6: |R5C6 - R6C6| = |R6C6 - R7C6|. The two ends share
  // column 6 and so cannot be equal, which leaves only the signed reading
  // R5C6 - R6C6 = R6C6 - R7C6, written here as R5C6 - 2*R6C6 + R7C6 = 0.
  new Sum(0, ['R5C6', 1], ['R6C6', -2], ['R7C6', 1]),

  // Arrow: circle R6C6, single shaft cell R7C7.
  new Arrow('R6C6', 'R7C7'),

  new X('R5C3', 'R5C4'),
  new X('R1C9', 'R2C9'),

  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R2C5', 'R3C5'),

  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R4C5', 'R4C6'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R2C8', 'R3C8'),

  // Inequality signs: one constraint per drawn sign, the larger cell first.
  new GreaterThan('R1C2', 'R1C1'),
  new GreaterThan('R1C2', 'R1C3'),
  new GreaterThan('R1C2', 'R2C2'),
  new GreaterThan('R1C8', 'R1C7'),
  new GreaterThan('R1C8', 'R1C9'),
  new GreaterThan('R1C8', 'R2C8'),

  // Red line: a region sum line, so its four box segments
  //   box 7: R8C1,R8C2,R7C3   box 8: R7C4,R7C5
  //   box 5: R6C5,R5C5,R4C4   box 2: R3C4,R2C5,R1C6
  // share a common total N.
  //
  // Omitted: the caption's second half, "lowest possible value" -- that N is
  // the smallest value for which the rest of the puzzle still has a solution.
  // That is a property of the whole puzzle's solution set, not of the line, so
  // no value of N is ruled out here.
  new RegionSumLine(
    'R8C1', 'R8C2', 'R7C3', 'R7C4', 'R7C5', 'R6C5', 'R5C5', 'R4C4',
    'R3C4', 'R2C5', 'R1C6'),
];
