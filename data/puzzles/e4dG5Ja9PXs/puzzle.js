// Title: unknown
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=e4dG5Ja9PXs
// Source: https://cracking-the-cryptic.web.app/sudoku/LdN6tfpGDL

// Normal Sudoku rules apply (default rows/columns/3x3 boxes). There are
// three identical 9-cell shaded regions (each a translated copy of the
// others). Two of the three are clones of each other -- the same digit
// appears in each pair of corresponding cells -- and the third is an extra
// region where each digit 1-9 appears exactly once. Which two regions are
// the clones and which is the extra region is not stated in the rules; it is
// for the solver to determine, so the encoding disjoins over the three ways
// to choose the extra region.

// Region cell lists, in payload underlay order (`underlays`, `#CFCFCF` grey
// fill, converted from 0-indexed [row,col] centers to 1-indexed R#C#). Each
// region is the next translated by (-2 rows, +2 cols): C -> B -> A. Because
// they are congruent translates, listing each in the same underlay-array
// order gives the 1-to-1 correspondence the clone rule needs: index i of one
// region corresponds to index i of the other two.
const regionA = ['R1C5', 'R2C5', 'R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8', 'R5C8', 'R5C9'];
const regionB = ['R3C3', 'R4C3', 'R4C4', 'R5C4', 'R5C5', 'R6C5', 'R6C6', 'R7C6', 'R7C7'];
const regionC = ['R5C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5'];

// Cell-wise clone: one SameValues(2, a, b) per corresponding pair (not one
// SameValues over the full 18 cells, which would ask for the same multiset
// rather than the same value in each position).
const clonePairs = (region1, region2) =>
  region1.map((cell, i) => new SameValues(2, cell, region2[i]));

// The three ways to pick which region is the "extra" (all-different) one,
// with the other two cloned to each other.
const readings = [
  new And([new AllDifferent(...regionC), ...clonePairs(regionA, regionB)]),
  new And([new AllDifferent(...regionB), ...clonePairs(regionA, regionC)]),
  new And([new AllDifferent(...regionA), ...clonePairs(regionB, regionC)]),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C2', 3), new Given('R1C3', 8), new Given('R1C9', 4),
  new Given('R2C1', 4), new Given('R2C8', 7),
  new Given('R3C1', 5),
  new Given('R4C6', 9),
  new Given('R6C4', 1),
  new Given('R7C9', 5),
  new Given('R8C2', 2), new Given('R8C9', 9),
  new Given('R9C1', 9), new Given('R9C7', 2), new Given('R9C8', 6), new Given('R9C9', 1),
  new Or(readings),
];
