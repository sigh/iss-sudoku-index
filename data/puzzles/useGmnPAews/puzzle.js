// Title: 3 is a Magic Number
// Author: KWOG
// Video: https://www.youtube.com/watch?v=useGmnPAews
// Source: https://sudokupad.app/yv9zbsgm7n

// Normal sudoku rules apply. The rules describe a fog covering the grid that
// clears as digits are placed; that is a UI presentation only (the rules text
// says "no guesswork is required") and has no bearing on the solved grid, so
// it is not encoded.
//
// Box 3 (top-right) is a magic square: its rows, columns, and diagonals all
// share one common total.
//
// Kropki dots: white = the two digits are consecutive, black = one digit is
// double the other. Only the drawn dots are encoded; absence of a dot is not
// itself a rule for ordinary digit pairs (see "Magic Number 3" below for the
// one place absence does matter).
//
// Arrows: digits along the arrow's arm sum to the digit in its circle.
//
// Magic Number 3 (scoped to the digit 3 only, not a global rule):
//   (a) two 3s may not be a knight's move apart;
//   (b) a 3 may not be orthogonally adjacent to a 2, 4, or 6 unless that
//       edge carries one of the drawn Kropki dots.

const graph = cellGraph('9x9');

// -- Box 3 magic square -----------------------------------------------------
// Box 3 = raw payload regions[2] (top-right nonet), matching "Box 3" in the
// rules text. EqualSum over its 3 rows, 3 columns, and 2 diagonals is a magic
// square; the box's own all-different (default sudoku rule) then forces the
// common sum to 15 on its own.
const box3 = graph.block('R1C7', 3, 3);
const magicSquare = new EqualSum(
  [box3[0], box3[1], box3[2]],
  [box3[3], box3[4], box3[5]],
  [box3[6], box3[7], box3[8]],
  [box3[0], box3[3], box3[6]],
  [box3[1], box3[4], box3[7]],
  [box3[2], box3[5], box3[8]],
  [box3[0], box3[4], box3[8]],
  [box3[2], box3[4], box3[6]],
);

// -- Arrows -------------------------------------------------------------
// Transcribed from raw payload arrows[]: each waypoint list is the circle
// cell followed by the arm cells (straight segments interpolated to their
// crossed cells).
const arrows = [
  new Arrow('R3C4', 'R4C3', 'R5C3'),
  new Arrow('R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'),
  new Arrow('R9C8', 'R9C7', 'R8C7'),
];

// -- Kropki dots ----------------------------------------------------------
// Transcribed from raw payload overlays[]: solid black-filled markers are
// black (ratio) dots, white-filled black-bordered markers are white
// (consecutive) dots.
const blackDotEdges = [
  ['R2C6', 'R2C7'],
  ['R1C4', 'R1C5'],
  ['R4C2', 'R4C3'],
  ['R6C1', 'R6C2'],
  ['R6C3', 'R6C4'],
  ['R7C2', 'R8C2'],
  ['R6C4', 'R7C4'],
  ['R8C5', 'R8C6'],
  ['R4C8', 'R5C8'],
];
const whiteDotEdges = [
  ['R1C9', 'R2C9'],
  ['R5C8', 'R5C9'],
  ['R5C7', 'R5C8'],
  ['R5C5', 'R6C5'],
  ['R1C1', 'R2C1'],
  ['R2C7', 'R3C7'],
  ['R8C6', 'R9C6'],
];
const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));
const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

// -- Magic Number 3 ---------------------------------------------------------
// Both parts below are a single translated relation stamped across many
// cell pairs, so each relative offset is built once as a Pair template and
// stamped onto every valid origin with Replicate (one Replicate per offset),
// rather than one Pair per pair.
//
// replicatePairs groups all cell pairs at each of the given (dRow, dCol)
// offsets, and turns each group into one Replicate carrying a single Pair
// template, targeted at every cell where the offset stays on the grid.
// Uses a bare `new Replicate` (not graph.makeReplicate()) because each
// offset's template is anchored at its own first valid origin, not R1C1.
function replicatePairs(offsets, key, label, allowedPair) {
  const byOffset = new Map(offsets.map(o => [`${o[0]},${o[1]}`, []]));
  for (const cell of graph.cells()) {
    for (const [dR, dC] of offsets) {
      const other = graph.step(cell, dR, dC);
      if (other && allowedPair(cell, other)) byOffset.get(`${dR},${dC}`).push(cell);
    }
  }
  const replicated = [];
  for (const [offsetKey, origins] of byOffset) {
    if (origins.length === 0) continue;
    const [dR, dC] = offsetKey.split(',').map(Number);
    // graph.cells() is row-major, so the first origin found for this offset
    // has the lowest cell index -- required as the Replicate origin.
    const templateOrigin = origins[0];
    const templateOther = graph.step(templateOrigin, dR, dC);
    // graph.makeReplicate() always anchors at R1C1; several offsets here
    // have no valid template at R1C1 (e.g. dC < 0), so the origin must be
    // each offset's own first valid cell instead.
    replicated.push(new Replicate(
      [new Pair(key, label, templateOrigin, templateOther)],
      Replicate.encodeTargetCells(origins, templateOrigin, graph),
      templateOrigin,
    ));
  }
  return replicated;
}

// (a) No two 3s a knight's move apart. Scoped to the digit 3 only, so this is
// not the built-in AntiKnight (which forbids any repeat within a knight's
// move) -- only value 3 is restricted.
const KNIGHT_OFFSETS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const notBothThree = Pair.fnToKey((a, b) => !(a === 3 && b === 3), 9);
const noKnightThrees = replicatePairs(
  KNIGHT_OFFSETS, notBothThree, 'no knight-move 3s', () => true);

// (b) A 3 may not be orthogonally adjacent to a 2, 4, or 6 without a Kropki
// dot on that edge. Scoped to the digit 3 only, so this is a negative
// relation over the dotless edges (all orthogonal adjacencies minus the
// drawn dot list above), not the global StrictKropki.
const dottedEdgeKeys = new Set(
  [...blackDotEdges, ...whiteDotEdges].map(([a, b]) => [a, b].sort().join('_')));
const isDotless = (a, b) => !dottedEdgeKeys.has([a, b].sort().join('_'));
const ORTHOGONAL_OFFSETS = [[0, 1], [1, 0]];
const noChaperoneNeeded = Pair.fnToKey(
  (a, b) => !((a === 3 && (b === 2 || b === 4 || b === 6)) ||
    (b === 3 && (a === 2 || a === 4 || a === 6))),
  9);
const noUnchaperonedThrees = replicatePairs(
  ORTHOGONAL_OFFSETS, noChaperoneNeeded, 'no unchaperoned 3 next to 2/4/6',
  isDotless);

return [
  new Shape('9x9'),
  magicSquare,
  ...arrows,
  ...blackDots,
  ...whiteDots,
  ...noKnightThrees,
  ...noUnchaperonedThrees,
];
