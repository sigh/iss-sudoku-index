// Title: Three out of Four
// Author: Coyote
// Video: https://www.youtube.com/watch?v=flNDy3Udgfw
// Source: https://app.crackingthecryptic.com/sudoku/QtNgbdQBBh

// Normal sudoku rules apply (standard 3x3 boxes from Shape('9x9')).
// Identical digits cannot be separated by a king's move in chess (AntiKing).
// Digits on an arrow sum to the number in the circle (Arrow: circled cell
// first, then arm cells in order away from the circle).
// Digits joined by a white dot are consecutive (WhiteDot).
// Neighbouring digits on a green line have a difference of at least five
// (Whisper, default difference 5).
//
// Each arrow is drawn as a single straight diagonal stroke with a circle at
// one end; the circle's cell is the arrow's own overlay entry (width/height
// covering the full cell), which sits at the stroke's first waypoint in every
// case here, and the arrowhead is the stroke's other end. Two pairs of arrows
// cross through a shared arm cell (R2C8, R8C8, R8C2 -- each a given), and one
// pair shares a circled cell instead (R6C4, not given).

return [
  new Shape('9x9'),

  new Given('R2C8', 2),
  new Given('R8C2', 4),
  new Given('R8C8', 5),

  new AntiKing(),

  new Arrow('R1C7', 'R2C8', 'R3C9'),
  new Arrow('R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R4C4', 'R5C5', 'R6C6'),
  new Arrow('R6C4', 'R5C5', 'R4C6'),
  new Arrow('R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Arrow('R7C9', 'R8C8', 'R9C7'),
  new Arrow('R9C3', 'R8C2', 'R7C1'),
  new Arrow('R6C4', 'R7C3', 'R8C2', 'R9C1'),

  new Whisper('R2C4', 'R2C5', 'R2C6'),
  new Whisper('R3C4', 'R3C5', 'R3C6'),
  new Whisper('R3C2', 'R4C2', 'R5C2'),
  new Whisper('R5C8', 'R6C8', 'R7C8'),
  new Whisper('R8C4', 'R8C5', 'R8C6'),
  new Whisper('R9C4', 'R9C5', 'R9C6'),

  new WhiteDot('R4C3', 'R4C4'),
  new WhiteDot('R4C6', 'R4C7'),
  new WhiteDot('R6C4', 'R7C4'),
];
