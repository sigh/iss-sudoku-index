// Title: Loose associations
// Author: dumediat
// Video: https://www.youtube.com/watch?v=RFGdR9dFNUc
// Source: https://app.crackingthecryptic.com/sudoku/8f23Ng2dgf

// The central 9x9 is normal sudoku.  The 36 non-corner grey-frame cells are
// auxiliary digits: each is an outside indexing clue.  Point cages choose one
// orthogonal destination X cells away and sum their source X with that digit.
// Blue paths have equal sums in each 3x3 box or in their grey-frame segment.

const ring = new Var('O', 'grey outside ring', 36);

// Clockwise ring order: top, right, bottom right-to-left, left bottom-to-top.
function at(r, c) {
  if (r >= 1 && r <= 9 && c >= 1 && c <= 9) return makeCellId(r, c);
  if (r === 0 && c >= 1 && c <= 9) return ring.cell(c);
  if (c === 10 && r >= 1 && r <= 9) return ring.cell(9 + r);
  if (r === 10 && c >= 1 && c <= 9) return ring.cell(19 + 9 - c);
  if (c === 0 && r >= 1 && r <= 9) return ring.cell(28 + 9 - r);
  return null; // The four black frame corners are not cells.
}

function pointCage(total, r, c) {
  const source = at(r, c);
  const alternatives = [];
  for (let value = 1; value <= 9; value++) {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const target = at(r + dr * value, c + dc * value);
      if (target) {
        alternatives.push(new And([
          new Given(source, value),
          new Sum(total, source, target),
        ]));
      }
    }
  }
  return new Or(alternatives);
}

function outsideClue(clue, first, directionCells) {
  return new Or(directionCells.map((target, index) => new And([
    new Given(first, index + 1),
    new SameValues(2, clue, target),
  ])));
}

const outsideClues = [
  ...Array.from({ length: 9 }, (_, i) => outsideClue(at(0, i + 1), at(1, i + 1), Array.from({ length: 9 }, (_, j) => at(j + 1, i + 1)))),
  ...Array.from({ length: 9 }, (_, i) => outsideClue(at(i + 1, 10), at(i + 1, 9), Array.from({ length: 9 }, (_, j) => at(i + 1, 9 - j)))),
  ...Array.from({ length: 9 }, (_, i) => outsideClue(at(10, i + 1), at(9, i + 1), Array.from({ length: 9 }, (_, j) => at(9 - j, i + 1)))),
  ...Array.from({ length: 9 }, (_, i) => outsideClue(at(i + 1, 0), at(i + 1, 1), Array.from({ length: 9 }, (_, j) => at(i + 1, j + 1)))),
];

const pointCages = [
  pointCage(16, 1, 4), pointCage(5, 1, 10), pointCage(8, 2, 7),
  pointCage(11, 2, 2), pointCage(10, 5, 5), pointCage(7, 6, 2),
  pointCage(9, 6, 4), pointCage(9, 6, 8), pointCage(13, 7, 1),
  pointCage(8, 7, 10),
];

const blueLines = [
  new EqualSum([at(1, 4)], [at(0, 4), at(0, 5)]),
  new EqualSum([at(0, 7)], [at(1, 7), at(2, 7)]),
  new EqualSum([at(1, 9), at(2, 9)], [at(3, 10)]),
  new EqualSum([at(4, 7)], [at(5, 6), at(6, 6)], [at(7, 6)]),
  new EqualSum([at(7, 7), at(7, 8)], [at(6, 8)]),
  new EqualSum([at(6, 2), at(6, 1)], [at(6, 0)]),
  new EqualSum([at(7, 0)], [at(8, 1), at(8, 2), at(8, 3)], [at(8, 4)]),
  new EqualSum([at(2, 2), at(3, 3)], [at(4, 3), at(5, 3)]),
];

return [
  new Shape('9x9'),
  ring,
  ...outsideClues,
  ...pointCages,
  ...blueLines,
];
