// Title: Lace Agate
// Author: Niverio
// Video: https://www.youtube.com/watch?v=aURZi_Ml_DM
// Source: https://app.crackingthecryptic.com/sudoku/NNttMGHq7T

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Every blue line is a RegionSumLine: equal sum N within each box it passes
// through, with each separate visit to a box ("entry") summing to N on its
// own when a line re-enters a box more than once.
//
// The drawn strokes are split across more `lines[]` entries in the payload
// than there are visual lines: groups of entries chain end-to-end at exactly
// matching coordinates, so each group is one continuous line.
//
// lines[10] meets lines[9] not at an endpoint but at R6C8, an interior cell
// of lines[9]'s own path -- a three-way branch, not a simple continuation. A
// RegionSumLine's segments are read by walking one cell list in order, which
// cannot express a fork, so that cluster is encoded with EqualSum instead:
// one array per box-visit (the same same-box-run segments a non-branching
// RegionSumLine would use), forcing every visit anywhere in the branching
// figure to the same total.
return [
  new Shape('9x9'),

  // lines[0]+[5]+[3]+[4]+[1] joined end to end (R7C2, R7C3, R9C3 are each
  // shared endpoints between consecutive fragments).
  new RegionSumLine(
    'R8C2', 'R7C2', 'R6C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C3', 'R9C2'),

  // lines[2].
  new RegionSumLine('R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),

  // lines[6].
  new RegionSumLine('R7C4', 'R6C3', 'R5C3'),

  // lines[7] -- the rule text's own worked example (r3c3 = r2c4+r3c4 =
  // r4c4+r5c4).
  new RegionSumLine('R2C4', 'R3C4', 'R3C3', 'R4C4', 'R5C4'),

  // lines[8].
  new RegionSumLine('R1C4', 'R1C3', 'R2C3'),

  // lines[12]+[9]+[10]: branching region sum line, see the note above. Box
  // visits, in the order the strokes draw them: box(2,2) R4C6-R5C6,
  // box(2,3) R5C7-R6C7, box(3,3) R7C7-R7C8, then the branch at R6C8 --
  // box(2,3) again via R6C8-R5C8, and box(3,3) again via the single cell
  // R7C9.
  new EqualSum(
    ['R4C6', 'R5C6'],
    ['R5C7', 'R6C7'],
    ['R7C7', 'R7C8'],
    ['R6C8', 'R5C8'],
    ['R7C9']),

  // lines[11].
  new RegionSumLine('R2C7', 'R2C8', 'R3C8', 'R3C7', 'R3C6', 'R3C5'),

  // lines[13].
  new RegionSumLine('R3C9', 'R4C9', 'R5C9'),

  // lines[14].
  new RegionSumLine('R9C6', 'R8C6', 'R8C7', 'R9C8'),
];
