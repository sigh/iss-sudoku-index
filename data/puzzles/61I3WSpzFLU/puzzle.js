// Title: 2 degrees
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=61I3WSpzFLU
// Source: https://app.crackingthecryptic.com/sudoku/3JqbBfpJHp

// Normal sudoku rules apply (row/column/box all-different come with
// Shape('9x9')). Digits along thermometers increase from the bulb.
// Diagonally adjacent digits joined by a white dot are consecutive; those
// joined by a black dot are in a 1:2 ratio. No other diagonally adjacent
// digits in the grid are consecutive or in a 1:2 ratio. Every clause of the
// rules is encoded; nothing is omitted.
//
// Both dots are drawn centred on a grid corner point -- equidistant from all
// four cells of a 2x2 block, with no offset, tilt or marker favouring either
// of the two diagonals crossing there. Both of a corner's diagonal pairs are
// therefore joined by its dot, and the rules quantify over every pair a dot
// joins, so each dot constrains two pairs. The parenthetical "(1 and 2 might
// be joined by a white or black dot)" is a note about which relation a 1-2
// pair satisfies, not a further restriction, so it needs no constraint.
//
// WhiteDot/BlackDot bind by orthogonal grid adjacency, so every diagonal
// relation below is a Pair with an explicit predicate instead.

const graph = cellGraph('9x9');

const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const ratio2 = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const unrelated = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a,
  9,
);

// Drawn geometry, transcribed from the two grey lines and the two dot
// overlays. Thermometers are listed bulb first; thermometer A's every step
// is a diagonal one, thermometer B's every step is orthogonal.
const thermoA = ['R4C7', 'R3C6', 'R4C5', 'R5C4', 'R4C3'];
const thermoB = ['R3C5', 'R3C4', 'R2C4', 'R2C3'];
// Each dot sits on the corner shared by a 2x2 block; name it by that block's
// top-left cell. White: the R3C5/R3C6/R4C5/R4C6 corner. Black: the
// R3C3/R3C4/R4C3/R4C4 corner.
const whiteDotCorner = 'R3C5';
const blackDotCorner = 'R3C3';

// The two diagonal pairs meeting at a corner, from its block's top-left cell:
// the main diagonal (top-left with bottom-right) and the anti-diagonal
// (top-right with bottom-left). Each pair is listed with the cell that is the
// upper end of its offset first, so pair[1] === step(pair[0], ...offset).
const diagonalsAt = topLeft => [
  [topLeft, graph.step(topLeft, 1, 1)],
  [graph.step(topLeft, 0, 1), graph.step(topLeft, 1, 0)],
];

const whitePairs = diagonalsAt(whiteDotCorner);
const blackPairs = diagonalsAt(blackDotCorner);

// The closing rule covers every diagonally adjacent pair in the grid except
// the four a dot joins. Every such pair is one of exactly two offsets, so
// each offset becomes a single Replicate stamped over every origin cell that
// has that neighbour and is not the origin of a dotted pair.
const DIAGONAL_OFFSETS = [
  [1, 1],
  [1, -1],
];
const dotted = new Set(
  [...whitePairs, ...blackPairs].map(pair => pair.join('/')),
);
const unmarkedDiagonals = DIAGONAL_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => {
    const other = graph.step(cell, dr, dc);
    return other !== null && !dotted.has(`${cell}/${other}`);
  });
  const origin = targets[0];
  return new Replicate(
    [new Pair(unrelated, 'no relation', origin, graph.step(origin, dr, dc))],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  new Shape('9x9'),
  new Thermo(...thermoA),
  new Thermo(...thermoB),
  ...whitePairs.map(pair => new Pair(consecutive, 'white dot', ...pair)),
  ...blackPairs.map(pair => new Pair(ratio2, 'black dot', ...pair)),
  ...unmarkedDiagonals,
];
