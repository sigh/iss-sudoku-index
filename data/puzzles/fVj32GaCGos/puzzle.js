// Title: Ghost in the Machine
// Author: Pseudonum
// Video: https://www.youtube.com/watch?v=fVj32GaCGos
// Source: https://app.crackingthecryptic.com/sudoku/HQfMPMGpj3

// Normal sudoku, standard 3x3 boxes, no printed givens. Box numbering is the
// standard reading-order convention (1-9, left to right then top to bottom)
// -- the only numbering the puzzle defines. In box k, the digit k is a
// "ghost digit"; normal Sudoku already forces exactly one occurrence of
// digit k inside box k, so every box has exactly one ghost cell without any
// extra rule. The extra rule is that those nine ghost cells must also land
// one per row and one per column. In a cage, a ghost occurrence counts as
// zero towards the sum and is exempt from the cage's no-repeat rule. Along
// an arrow, a ghost occurrence counts as zero towards the arm sum, and every
// arrow (its bulb plus its whole line) contains exactly one ghost digit.
// "Digits may repeat along arrows, if allowed by the other constraints" is a
// clarifying note, not a separate rule: arrows are modelled with `Sum`,
// which never forces distinctness, so nothing further is needed for it.
//
// Modelled by widening the grid's value range to 0-9 (the main digit stays
// restricted to 1-9 per cell, Fog Eraser's technique, `0SQJRdZLRQs`, also
// used by the Ghost Digit puzzle `h0laOORacBw`). Two per-cell overlays ride
// on top of every grid cell's own (statically known) box number k:
//   - `VF` "effective value": 0 where that cell's digit equals k, the digit
//     itself otherwise. Cage totals are a plain `Sum` over these; an arrow's
//     arm and its bulb are an `EqualSum` over these (bulb keeps its raw
//     digit -- only arm cells get the ghost-zero treatment).
//   - `VG` "ghost indicator": 1 where the digit equals k, 0 otherwise. Row,
//     column and arrow ghost-counts are a plain `Sum(1, ...)` over these.
// Both overlays are linked to the digit by one `Pair` per cell, using a key
// built from that cell's own box number k -- there are only 9 distinct keys
// (one per box), reused across the 9 cells of each box, since k depends only
// on which box the cell is in.

const graph = cellGraph('9x9~0-9');
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Restrict the widened main grid back to real Sudoku digits (no givens).
const digitGivens = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// Boxes in standard reading order (1-9); BOXES[i] is box (i+1)'s 9 cells.
const BOXES = graph.boxes();
const boxIndexOf = new Map();
BOXES.forEach((cells, i) => cells.forEach(cell => boxIndexOf.set(cell, i)));

// One Pair key per box number k (1-9), shared by every cell in that box.
// numValues=10, valueOffset=-1 covers the value range 0-9 (fnToBinaryKey
// enumerates offset+1 .. offset+numValues), since these links read/write
// the ghost marker 0 as well as the 1-9 digit range.
const EFF_KEY = BOXES.map((_, i) => {
  const k = i + 1;
  return Pair.fnToKey((d, e) => (d === k && e === 0) || (d !== k && e === d), 10, -1);
});
const GHOST_KEY = BOXES.map((_, i) => {
  const k = i + 1;
  return Pair.fnToKey((d, g) => (d === k && g === 1) || (d !== k && g === 0), 10, -1);
});

// Cage cells and totals, transcribed from the payload's `cages` array
// (0-indexed [row,col] converted to 1-indexed R/C; three further entries are
// metadata stubs for title/author/rules, not cages).
const CAGES = [
  { total: 15, cells: ['R3C5', 'R3C6'] },
  { total: 17, cells: ['R3C7', 'R4C7', 'R4C8'] },
  { total: 3, cells: ['R5C8', 'R6C8', 'R6C7'] },
  { total: 4, cells: ['R8C9', 'R9C9', 'R9C8'] },
  { total: 21, cells: ['R9C7', 'R8C7', 'R7C7', 'R7C6'] },
  { total: 7, cells: ['R6C6', 'R6C5'] },
  { total: 17, cells: ['R5C5', 'R5C4', 'R6C4'] },
  { total: 4, cells: ['R8C2', 'R7C2', 'R7C3'] },
];

// Arrow bulb + line cells, transcribed from the payload's `arrows` array;
// each bulb's grey circle overlay confirms it (payload overlay list).
const ARROWS = [
  { bulb: 'R1C8', arm: ['R1C7', 'R1C6', 'R1C5', 'R1C4'] },
  { bulb: 'R2C2', arm: ['R2C1', 'R3C1', 'R4C1', 'R4C2'] },
  { bulb: 'R3C5', arm: ['R3C6', 'R3C7', 'R3C8'] },
  { bulb: 'R4C5', arm: ['R4C4', 'R4C3', 'R5C3'] },
  { bulb: 'R6C3', arm: ['R6C4', 'R6C5', 'R6C6', 'R5C6'] },
  { bulb: 'R6C9', arm: ['R5C9', 'R5C8', 'R5C7'] },
  { bulb: 'R7C7', arm: ['R7C6', 'R8C6', 'R9C6'] },
  { bulb: 'R9C7', arm: ['R9C8', 'R9C9', 'R8C9', 'R7C9'] },
  { bulb: 'R9C1', arm: ['R9C2', 'R8C2', 'R7C2', 'R7C3'] },
];

// Effective-value overlay: only the cells that sit in a cage or an arrow arm
// (the bulb's raw digit, not its effective value, is the arrow sum target).
const effCells = [...new Set([
  ...CAGES.flatMap(c => c.cells),
  ...ARROWS.flatMap(a => a.arm),
])];
const eff = graph.makeOverlay('VF', effCells);
const effLinks = effCells.map(cell =>
  new Pair(EFF_KEY[boxIndexOf.get(cell)], 'digit -> effective value (box ghost)', cell, eff.at(cell)));

// Ghost indicator overlay: every grid cell, needed for the row/column
// one-ghost-each rule and the per-arrow one-ghost rule (bulb included).
const ghost = graph.makeOverlay('VG');
const ghostBound = ghost.makeReplicate(new Given(ghost.cells()[0], 0, 1));
const ghostLinks = graph.cells().map(cell =>
  new Pair(GHOST_KEY[boxIndexOf.get(cell)], 'digit -> ghost indicator (box ghost)', cell, ghost.at(cell)));

// Exactly one ghost cell per row and per column.
const rowGhostCounts = graph.rows().map(cells => new Sum(1, ...ghost.at(cells)));
const colGhostCounts = graph.columns().map(cells => new Sum(1, ...ghost.at(cells)));

// Exactly one ghost cell per arrow (bulb + whole line together).
const arrowGhostCounts = ARROWS.map(({ bulb, arm }) => new Sum(1, ...ghost.at([bulb, ...arm])));

// Arrow sum: effective values along the arm sum to the bulb's raw digit.
const arrowSums = ARROWS.map(({ bulb, arm }) => new EqualSum([bulb], eff.at(arm)));

// Cage sum over effective values (a ghost occurrence contributes 0).
const cageSums = CAGES.map(({ total, cells }) => new Sum(total, ...eff.at(cells)));

// Cage distinctness over effective values, except a ghost (0) never
// conflicts with anything -- so a repeated ghost digit is allowed. Not a
// plain AllDifferent even for a 2-cell cage: the ghost exception lets a
// ghost's 0 sit alongside an equal non-ghost value.
const cageDistinctKey = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, 10, -1);
const cageDistinct = CAGES.map(({ cells }) =>
  new PairX(cageDistinctKey, 'cage distinct unless ghost', ...eff.at(cells)));

return [
  new Shape('9x9', '0-9'),
  digitGivens,
  eff.toVar('effective value'),
  ...effLinks,
  ghost.toVar('ghost indicator'),
  ghostBound,
  ...ghostLinks,
  ...rowGhostCounts,
  ...colGhostCounts,
  ...arrowGhostCounts,
  ...arrowSums,
  ...cageSums,
  ...cageDistinct,
];
