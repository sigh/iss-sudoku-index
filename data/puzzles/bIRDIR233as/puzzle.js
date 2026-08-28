// Title: Unknown
// Author: ukudos
// Video: https://www.youtube.com/watch?v=bIRDIR233as
// Source: https://cracking-the-cryptic.web.app/sudoku/FBHPg2HqTN

// Normal sudoku rules apply on the standard 9x9 grid with the ordinary 3x3
// boxes (Shape('9x9') covers rows/columns/boxes; the payload's own regions
// are those same nine blocks, so no NoBoxes/jigsaw handling is needed). No
// givens. Each cage sums to its printed total with no repeated digit
// (Cage's own semantics). The purple line is a 21-digit palindrome whose
// ends "have to be deduced": see the LOOP/rotation comments below for how
// that disjunction is built.

const LOOP = [
  // Drawn purple line, 21 distinct cells, walked in the order the source
  // stroke was drawn (interpolating its diagonal multi-cell segments). The
  // walk closes: R4C2 back to R3C3 is itself a drawn (diagonally adjacent)
  // step, so this is a closed 21-cell loop with no gap anywhere in it.
  'R3C3', 'R2C3', 'R1C4', 'R2C5', 'R3C6', 'R3C7', 'R4C8', 'R5C9', 'R6C9',
  'R7C8', 'R7C7', 'R6C7', 'R6C6', 'R7C5', 'R8C4', 'R8C3', 'R7C3', 'R6C2',
  'R6C1', 'R5C1', 'R4C2',
];
const N = LOOP.length; // 21

// Because the loop is closed, cutting it at any cell and reading the other
// 20 around gives a palindrome candidate whose first and last digits are
// automatically adjacent via the cut edge -- true for every one of the 21
// possible cuts, so the rules sentence "the first digit and the last digit
// lie adjacent to each other" holds regardless of which cut is right and
// does not itself select one. That selection is exactly what the rules say
// must be deduced by solving, so it is encoded as a disjunction over every
// candidate rather than fixed by the setter's drawing.
//
// Parameterize by the palindrome's centre cell instead of its cut: for
// centre index c, the 21-cell reading is the loop rotated so LOOP[c] sits in
// the middle (position 10 of 0..20); Palindrome then pairs the cells at
// equal loop-distance on either side of the centre (10 pairs), leaving the
// centre cell itself unpaired. The cell landing at position 0 and the cell
// landing at position 20 are exactly the two neighbours of LOOP[c] reached
// by going 10 steps each way around the 21-loop, which -- since 10+10+1=21
// -- are themselves adjacent via the loop's one remaining edge, matching the
// rules' "ends are adjacent" sentence for this centre too.
function rotatedAroundCentre(centreIndex) {
  const seq = [];
  for (let j = 0; j < N; j++) {
    seq.push(LOOP[((centreIndex - 10 + j) % N + N) % N]);
  }
  return seq;
}

const palindromeForEveryCentre = LOOP.map(
  (_, centreIndex) => new Palindrome(...rotatedAroundCentre(centreIndex)));

return [
  new Shape('9x9'),

  // Cages -- provenance: the puzzle's 13 real cages (a 14th cage-list entry
  // carries no cells and no total; it is a metadata stub, not a cage).
  new Cage(16, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(10, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(19, 'R1C8', 'R2C8', 'R3C8'),
  new Cage(17, 'R2C5', 'R3C5'),
  new Cage(7, 'R5C1', 'R6C1'),
  new Cage(8, 'R5C2', 'R6C2'),
  new Cage(9, 'R5C8', 'R5C9'),
  new Cage(6, 'R6C8', 'R6C9'),
  new Cage(6, 'R7C2', 'R7C3'),
  new Cage(9, 'R8C2', 'R8C3'),
  new Cage(10, 'R8C5', 'R9C5'),
  new Cage(8, 'R7C7', 'R8C7'),
  new Cage(7, 'R7C8', 'R8C8'),

  // Purple line: disjunction over which loop cell is the palindrome's
  // centre of symmetry (see the comments above).
  new Or(palindromeForEveryCentre),
];
