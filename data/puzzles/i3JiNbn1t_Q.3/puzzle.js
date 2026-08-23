// Title: August 8, 2021: Cupid Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://app.crackingthecryptic.com/sudoku/qMRg43pfRn

// Normal sudoku rules apply (default row/column/box all-different).
//
// "Digits on an arrow must repeat at least once in the direction of the
// arrow." Twelve small diagonal arrows are drawn, each entirely inside its
// own single cell (no bulb, no drawn path beyond that cell) with an
// arrowhead pointing toward one grid corner. Read as a Little-Killer-style
// ray: each arrow's cells are that cell plus every cell straight ahead of
// it, in its direction, out to the grid edge. The twelve arrows fall into
// four diagonal bands of six cells; the three arrows in a band start at
// three different cells and so mark three different nested rays (lengths
// 6, 5, 4), not one ray repeated three times -- kept as twelve separate
// constraints, one per drawn arrow.
//
// "Digits on an arrow must repeat at least once" is encoded as: some pair
// of cells on the ray share a value. SameValues(2, a, b) forces a === b;
// Or-ing that over every unordered pair in the ray is exactly "not all
// cells on the ray are distinct".

const rays = [
  // Band row-col=3, down-right toward R9C6: arrows at R4C1, R5C2, R6C3.
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['R6C3', 'R7C4', 'R8C5', 'R9C6'],
  // Band row+col=7, down-left toward R6C1: arrows at R1C6, R2C5, R3C4.
  ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['R3C4', 'R4C3', 'R5C2', 'R6C1'],
  // Band row+col=13, up-right toward R4C9: arrows at R9C4, R8C5, R7C6.
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R7C6', 'R6C7', 'R5C8', 'R4C9'],
  // Band row-col=-3, up-left toward R1C4: arrows at R6C9, R5C8, R4C7.
  ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'],
  ['R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'],
  ['R4C7', 'R3C6', 'R2C5', 'R1C4'],
];

function notAllDifferent(cells) {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      pairs.push(new SameValues(2, cells[i], cells[j]));
    }
  }
  return new Or(pairs);
}

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C3', 1),
  new Given('R2C4', 2),
  new Given('R2C6', 3),
  new Given('R2C7', 4),
  new Given('R3C2', 5),
  new Given('R3C5', 6),
  new Given('R3C8', 7),
  new Given('R4C2', 3),
  new Given('R4C8', 8),
  new Given('R5C3', 4),
  new Given('R5C7', 1),
  new Given('R6C4', 6),
  new Given('R6C6', 4),
  new Given('R7C5', 7),

  ...rays.map(notAllDifferent),
];
