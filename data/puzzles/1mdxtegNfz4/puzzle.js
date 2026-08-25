// Title: Let's Put a Smile on That Face
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=1mdxtegNfz4
// Source: https://app.crackingthecryptic.com/webapp/783HGdgLbF

// Normal sudoku on the plain 3x3 boxes, plus anti-knight (identical digits
// cannot be a knight's move apart) and killer cages (shown totals, no
// repeated digit within a cage). The cage footprints trace a smiley face
// (two "eyes", a "smile") -- decorative only, no rule beyond the cage sums.

const givens = [
  new Given('R1C1', 9),
  new Given('R1C9', 3),
  new Given('R9C3', 4),
  new Given('R9C7', 2),
];

const cages = [
  new Cage(17, 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'),
  new Cage(30, 'R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7'),
  new Cage(10, 'R5C1', 'R6C1'),
  new Cage(15, 'R6C2', 'R7C2'),
  new Cage(5, 'R7C3', 'R8C3'),
  new Cage(15, 'R8C4', 'R8C5', 'R8C6'),
  new Cage(11, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(14, 'R7C7', 'R8C7'),
  new Cage(12, 'R6C8', 'R7C8'),
  new Cage(8, 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  new AntiKnight(),
];
