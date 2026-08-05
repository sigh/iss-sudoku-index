// Title: Self-Described Killers
// Author: Jubale
// Video: https://www.youtube.com/watch?v=v20Y5nAJNOE
// Source: https://app.crackingthecryptic.com/sudoku/77Qb4gp8db

// Standard Sudoku applies. In each listed killer cage, digits do not repeat and
// the cage sum is the two-digit number formed by its two top-left cells, read
// left to right. Cage cell lists below are transcribed from the drawn outlines.
function selfCluedCage(cells) {
  const [tens, ones] = [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
  return [
    new AllDifferent(...cells),
    new Sum(0, ...cells, [tens, -10], [ones, -1]),
  ];
}

const cages = [
  ['R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C5'],
  ['R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2'],
  ['R4C3', 'R4C4', 'R5C4', 'R5C5'],
  ['R5C1', 'R5C2', 'R6C2', 'R7C2', 'R7C1', 'R6C1'],
  ['R9C1', 'R9C2', 'R9C4', 'R9C3', 'R9C6', 'R9C5', 'R9C8', 'R9C7'],
  ['R7C4', 'R7C5', 'R8C5'],
  ['R6C6', 'R6C7', 'R7C7', 'R8C7', 'R7C8'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C9'],
];

return [
  new Shape('9x9'),
  new Given('R1C8', 7),
  new Given('R3C6', 5),
  new Given('R4C6', 9),
  new Given('R6C1', 5),
  new Given('R6C7', 7),
  new Given('R7C8', 5),
  ...cages.flatMap(selfCluedCage),
];
