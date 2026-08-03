// Title: High Rise Window Washer
// Author: Will Power
// Video: https://www.youtube.com/watch?v=_RpghmquvmE
// Source: https://app.crackingthecryptic.com/sudoku/D28Pt8pqfB

// Normal sudoku rules (default row/col/box all-different, standard boxes).
// Cage: shows its sum (killer cage: distinct + sum), no other clue on it.
// Green line: adjacent-cell difference >= 5, and no digit repeats anywhere
// on the line. It is drawn as two strokes sharing cell R1C6 (a horizontal
// arm and a vertical arm), so R1C6 has three line-neighbours; that branch is
// reproduced by two Whisper calls sharing R1C6, plus one AllDifferent over
// the full 6-cell set for the no-repeat clause.
// Orange line: adjacent-cell difference >= 4, digits may repeat (so no
// AllDifferent). It is drawn as a single stroke that runs along row 9 and
// then hooks back, touching R9C6 a second time; passing the literal drawn
// path (with R9C6 listed twice) to one Whisper reproduces all three of its
// edges, since Whisper only binds array-adjacent list positions.
// Purple lines: each is a "consecutive set of digits, any order" (Renban).
// Drawn as 8 strokes, but two of them (raw entries 9 and 10) share cell
// R7C4 -- the 3rd cell of one stroke is the 1st cell of the other -- so
// they are one branching line, folded into a single 6-cell Renban (Renban
// is a set constraint, so the branch shape itself needs no extra encoding).
// That leaves 7 independent purple Renban clues; the closed loop (the
// 4th below) needs no closing repeat either, for the same reason.

const green = [
  new Whisper(5, 'R1C5', 'R1C6', 'R1C7'),
  new Whisper(5, 'R4C6', 'R3C6', 'R2C6', 'R1C6'),
  new AllDifferent('R1C5', 'R1C6', 'R1C7', 'R2C6', 'R3C6', 'R4C6'),
];

const orange = [
  new Whisper(4,
    'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8',
    'R8C8', 'R8C7', 'R8C6', 'R9C6'),
];

const purple = [
  new Renban('R1C2', 'R2C2', 'R3C2'),
  new Renban('R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new Renban('R4C2', 'R5C3', 'R5C4', 'R5C5', 'R4C6'),
  new Renban('R3C4', 'R3C5', 'R4C5', 'R4C4'),
  new Renban('R2C8', 'R3C8', 'R4C8'),
  new Renban('R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Renban('R9C3', 'R8C4', 'R7C4', 'R6C4', 'R8C5', 'R9C5'),
];

return [
  new Shape('9x9'),
  new Given('R1C6', 8),
  new Given('R4C4', 1),
  new Given('R9C2', 1),
  new Given('R9C5', 2),
  new Cage(7, 'R4C8', 'R5C8'),
  ...green,
  ...orange,
  ...purple,
];
