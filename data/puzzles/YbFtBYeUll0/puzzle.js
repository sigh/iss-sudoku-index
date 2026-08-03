// Title: Sherlock's advice to the good Dr. Watson
// Author: HalfBakedLunatic
// Video: https://www.youtube.com/watch?v=YbFtBYeUll0
// Source: https://app.crackingthecryptic.com/sudoku/NrrMdpBTh9

// Normal sudoku rules (9x9, standard boxes, no givens). Two rule families
// beyond that: palindrome lines, and cages summing to their corner total.
// A fourth, global rule forbids any orthogonally adjacent pair summing to
// 5 or 10 -- there are no drawn X/V/dot marks, so this applies to every
// edge in the grid.

// Cages: total + cells, transcribed from the drawn cage outlines and their
// top-left corner totals (distinct digits, sum to that total).
const cages = [
  new Cage(15, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(22, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(15, 'R4C3', 'R5C3', 'R6C3'),
  new Cage(15, 'R4C7', 'R5C7'),
  new Cage(27, 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
  new Cage(15, 'R8C9', 'R9C9'),
];

// Palindrome lines, transcribed from the two drawn lines (both identical:
// light grey, thickness 16). Cell order along each line does not matter
// since a palindrome is symmetric.
const palindromes = [
  new Palindrome('R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C3', 'R9C3'),
  new Palindrome('R1C7', 'R2C7', 'R3C7', 'R4C8', 'R5C8', 'R6C8'),
];

// "Orthogonally adjacent cells do not sum to either 5 or 10": no dedicated
// class exists for this, so it is a negated-predicate Pair applied to every
// grid edge. There are two shift-invariant templates -- horizontal and
// vertical -- so each is one Replicate over every valid anchor position
// (computed from the grid geometry, not hand-enumerated) rather than one
// Pair per edge.
const graph = cellGraph('9x9');
const notFiveOrTen = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const rightAnchors = graph.cells().filter(c => graph.step(c, 0, 1));
const downAnchors = graph.cells().filter(c => graph.step(c, 1, 0));
const noFiveOrTenAdjacency = [
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'not 5 or 10', 'R1C1', 'R1C2'), rightAnchors),
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'not 5 or 10', 'R1C1', 'R2C1'), downAnchors),
];

return [
  new Shape('9x9'),
  ...cages,
  ...palindromes,
  ...noFiveOrTenAdjacency,
];
