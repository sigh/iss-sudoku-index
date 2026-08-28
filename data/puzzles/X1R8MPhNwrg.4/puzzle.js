// Title: Oct 28, 2021: Big Bands Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=X1R8MPhNwrg
// Source: https://tinyurl.com/5esprc2e

// Rules encoded here:
//  - Normal sudoku.
//  - Six grey "bands" (orthogonally-connected runs of 7 cells each, found by
//    connected-component analysis of the payload's shaded cells -- the
//    payload draws no explicit line objects) each carry one of six printed
//    7-digit sequences, read in either direction; which sequence goes on
//    which band is for the solver to determine, and each sequence is used on
//    exactly one band (a one-to-one correspondence between the six bands and
//    the six sequences).
// Nothing is omitted.

// The six bands: orthogonally-connected runs of 7 shaded cells each, with no
// branching, so each run has exactly one path (its two degree-1 endpoints).
// Each cell list is ordered start-to-end along that path; either end may be
// the sequence's "forwards" direction.
const bands = [
  // A: top edge.
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  // B: bottom edge.
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  // C: left edge.
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  // D: right edge.
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  // E: inner top-right L.
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'],
  // F: inner bottom-left L.
  ['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
];

// The six printed 7-digit sequences, from the rules text verbatim.
const sequences = [
  [1, 3, 5, 6, 4, 7, 8],
  [2, 3, 4, 5, 6, 7, 8],
  [3, 4, 1, 2, 5, 8, 7],
  [4, 5, 2, 3, 6, 7, 8],
  [5, 3, 8, 7, 1, 4, 2],
  [6, 1, 8, 9, 2, 8, 9],
];

// One auxiliary cell per band, holding the 1-6 index of the sequence it
// carries. AllDifferent over these six cells forces a bijection between
// bands and sequences (each sequence used exactly once); the per-band Or
// below only offers branches for sequence indices 1-6, so a solution
// necessarily assigns each band cell one of those six values -- no explicit
// domain restriction is needed.
const bandSeq = new Var('B', 'BandSequence', 6);

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C2', 8),
  new Given('R8C8', 3),
  new Given('R9C9', 6),

  bandSeq,
  new AllDifferent(...bandSeq.cells()),

  ...bands.map((cells, i) => new Or(
    sequences.flatMap((seq, s) => [
      // Forwards: band's first cell gets the sequence's first digit.
      new And([
        new Given(bandSeq.cell(i + 1), s + 1),
        ...cells.map((cell, j) => new Given(cell, seq[j])),
      ]),
      // Backwards: band's first cell gets the sequence's last digit.
      new And([
        new Given(bandSeq.cell(i + 1), s + 1),
        ...cells.map((cell, j) => new Given(cell, seq[seq.length - 1 - j])),
      ]),
    ])
  )),
];
