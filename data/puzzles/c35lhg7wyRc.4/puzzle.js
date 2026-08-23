// Title: German Whispers Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c35lhg7wyRc
// Source: https://app.crackingthecryptic.com/sudoku/DgR37JjRqG

// Normal sudoku rules apply. Any two digits next to each other on a line
// must have a difference of at least 5. Two separate grey lines (source
// waypoints, no shared cells), each encoded as Whisper(5) over its cells
// in drawn order.

return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R9C8', 3),

  new Whisper('R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1',
    'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3',
    'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4',
    'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6'),

  new Whisper('R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7',
    'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R2C8', 'R1C8'),
];
