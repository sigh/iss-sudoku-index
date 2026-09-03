// Title: Polyamorous Cages
// Author: Ennead
// Video: https://www.youtube.com/watch?v=IYgmGdvqgsw
// Source: https://app.crackingthecryptic.com/sudoku/q6pR9DQghg

// Rules encoded here:
//   Normal sudoku rules apply.
//   Digits cannot repeat in cages.
//   Any group of three adjacent cages must sum to 45.
//   Cells with identical colours contain identical digits.
// The grid has no given digits, and 28 of the 81 cells lie in no cage.

const graph = cellGraph('9x9');

// The 16 drawn cage outlines, in the order the source lists them. None carries
// a printed total. Cages 0-7 form one chain of cages down the left/centre of
// the grid, 8-11 a chain across the top right, 12-15 a chain in the bottom
// left.
const cages = [
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R8C6', 'R8C7', 'R7C7', 'R7C8', 'R6C8'],
  ['R7C6', 'R6C6', 'R6C7'],
  ['R6C5', 'R5C5', 'R5C6'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R3C2', 'R2C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C2', 'R1C3', 'R2C3', 'R1C4'],
  ['R2C5'],
  ['R2C6', 'R2C7'],
  ['R1C9', 'R1C8', 'R2C8', 'R3C8', 'R3C7', 'R4C7'],
  ['R2C9', 'R3C9'],
  ['R8C3', 'R9C3', 'R9C4'],
  ['R7C2', 'R7C1', 'R6C1'],
  ['R8C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R5C2', 'R6C2'],
];

// "Digits cannot repeat in cages": a cage with sum 0 emits all-different only.
const cageConstraints = cages.map((cells) => new Cage(0, ...cells));

// "Any group of three adjacent cages": two cages are adjacent when a cell of
// one shares an edge with a cell of the other, and a group of three is three
// cages that hang together under that adjacency. Derived from the cage
// outlines above rather than hand-listed.
//
// Two readings of "adjacent" were weighed. Counting cages that meet only at a
// corner makes the rule self-contradictory before any digit is placed: cages 5,
// 6, 7 are then a group and so are 5, 7, 8 (R2C5 meets R3C4 and R1C4 corner to
// corner), so the two totals give sum(cage 6) = sum(cage 8), yet cage 6 holds
// five distinct digits (at least 15) and cage 8 is one cell (at most 9).
// Sharing an edge is the reading kept.
//
// "Group of three" is read as three cages joined into one contiguous group, not
// as three cages each touching the other two. The art rules the stricter
// reading out: only cages 5, 6, 7 touch each other pairwise, which would leave
// the single-cell cage 8 -- whose all-different says nothing on its own -- with
// no role in the puzzle at all.
const cellSets = cages.map((cells) => new Set(cells));
const cagesAdjacent = (i, j) => cages[i].some(
  (cell) => graph.neighbours(cell).some((n) => cellSets[j].has(n)));

const adjacentTriples = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    for (let k = j + 1; k < cages.length; k++) {
      // Connected as a group of three: at least two of the three cage pairs
      // touch, which on three nodes is exactly connectedness.
      const edges = [[i, j], [i, k], [j, k]].filter(([a, b]) => cagesAdjacent(a, b));
      if (edges.length >= 2) adjacentTriples.push([i, j, k]);
    }
  }
}

// "must sum to 45": a plain Sum, since digits may repeat across the three
// cages even though each cage is internally all-different.
const tripleSums = adjacentTriples.map(
  (triple) => new Sum(45, ...triple.flatMap((i) => cages[i])));

// "Cells with identical colours contain identical digits": two blue circles at
// R1C4/R4C1 and two yellow circles at R4C7/R7C4. SameValues(2, ...) reads its
// cells as 2 sets of equal size, here one cell each.
const colourPairs = [
  new SameValues(2, 'R1C4', 'R4C1'),
  new SameValues(2, 'R4C7', 'R7C4'),
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...tripleSums,
  ...colourPairs,
];
