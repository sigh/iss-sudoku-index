// Title: June 7: S, as in "Still GAS"
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/2p969u3b

// Normal sudoku rules apply.
// XV Pairs: digits separated by an X sum to 10, by a V sum to 5. Not all
// X's and V's are necessarily given, so unmarked adjacent pairs carry no
// constraint (StrictXV does not apply here).
// German Whispers: neighboring digits along a green line must differ by at
// least 5 (Whisper's default difference).

return [
  new Shape('9x9'),

  // Givens (R1C3=8 R1C7=1 R2C1=2 R3C9=4 R5C2=8 R5C8=3 R7C1=3 R8C9=2 R9C3=2
  // R9C7=5), from the payload's grid values.
  new Given('R1C3', 8),
  new Given('R1C7', 1),
  new Given('R2C1', 2),
  new Given('R3C9', 4),
  new Given('R5C2', 8),
  new Given('R5C8', 3),
  new Given('R7C1', 3),
  new Given('R8C9', 2),
  new Given('R9C3', 2),
  new Given('R9C7', 5),

  // XV pairs, from the payload's xv entries.
  new V('R2C6', 'R3C6'),
  new V('R7C4', 'R8C4'),
  new X('R1C4', 'R1C5'),
  new X('R9C5', 'R9C6'),
  new V('R6C2', 'R6C3'),
  new X('R4C7', 'R4C8'),
  new X('R5C9', 'R6C9'),
  new X('R4C1', 'R5C1'),

  // Green German Whispers line, from the payload's single rendered line.
  new Whisper(
    'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C3', 'R5C4', 'R5C5', 'R5C6',
    'R6C7', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3',
  ),
];
