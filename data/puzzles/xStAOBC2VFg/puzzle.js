// Title: Two Ants Sudoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=xStAOBC2VFg
// Source: https://app.crackingthecryptic.com/sudoku/LN64rmPQ8n

// Normal sudoku rules apply. Digits ascend along thermometers from the bulb
// to the end(s). Black dots mark connections between cells with a ratio of
// 1:2; the rules state not all such dots are marked, so no negative closure
// is encoded for unmarked pairs.
//
// The grid draws two "ant" shapes, each a tree of thermometer segments
// (payload `lines`) all meeting at one bulb cell (marked by a grey circle
// overlay covering that cell). Every drawn line passes through its ant's
// bulb cell as an interior waypoint, not as a list endpoint, and two lines
// per ant fully share a multi-edge sub-path near the bulb (confirmed by
// edge-union: 4 lines per ant reduce from 18 raw edges to 16 distinct edges,
// each duplicate being a segment two lines draw identically). That is the
// branching-bulb case: one thermometer object per ant, with several "ends"
// (the rules text says "to the end(s)", plural), not four independent
// straight thermometers. Each root-to-leaf path through the tree is encoded
// as its own Thermo (root cell first); paths necessarily share cells and
// edges near the bulb, which is expected for a branching thermometer.

const ant1Root = 'R4C3'; // bulb: grey circle overlay, full-cell, on R4C3
const ant1Arms = [
  ['R5C4'],
  ['R5C2'],
  ['R4C4', 'R3C5'],
  ['R4C2', 'R3C1'],
  ['R3C3', 'R3C4', 'R2C5'],
  ['R3C3', 'R3C2', 'R2C1'],
  ['R3C3', 'R2C3', 'R2C4', 'R1C5'],
  ['R3C3', 'R2C3', 'R2C2', 'R1C1'],
];

const ant2Root = 'R7C5'; // bulb: grey circle overlay, full-cell, on R7C5
const ant2Arms = [
  ['R6C4'],
  ['R8C4'],
  ['R6C5', 'R5C6'],
  ['R8C5', 'R9C6'],
  ['R7C6', 'R6C6', 'R5C7'],
  ['R7C6', 'R8C6', 'R9C7'],
  ['R7C6', 'R7C7', 'R6C7', 'R5C8'],
  ['R7C6', 'R7C7', 'R8C7', 'R9C8'],
];

const thermos = [...ant1Arms, ...ant2Arms].map((arm, i) => {
  const root = i < ant1Arms.length ? ant1Root : ant2Root;
  return new Thermo(root, ...arm);
});

// Black (Kropki) ratio dots: one value is double the other. Each pair is an
// edge overlay (small black rounded mark) transcribed from the puzzle's own
// overlay geometry, converted from its edge-midpoint coordinate to the two
// cells it sits between.
const blackDots = [
  ['R1C3', 'R1C4'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R4C7'],
  ['R8C8', 'R9C8'],
  ['R8C8', 'R8C9'],
  ['R8C9', 'R9C9'],
  ['R8C2', 'R8C3'],
].map((pair) => new BlackDot(...pair));

return [
  new Shape('9x9'),
  ...thermos,
  ...blackDots,
];
