// Title: This Sums To 11
// Author: Blobz
// Video: https://www.youtube.com/watch?v=VcxJ3vXCgls
// Source: https://app.crackingthecryptic.com/sudoku/DQFHFNM7gG

// Normal sudoku rules (rows/columns/boxes all-different) come from the
// default Shape('9x9'). Twenty domino cages sum to 11; the rules add that
// "all such dominoes are shown", i.e. no domino outside a cage may sum to
// 11 -- so every other orthogonally-adjacent cell pair gets an explicit
// negative constraint. Adjacent digits along a
// green line must differ by at least 5 (Whisper); a green line's drawn path
// can step to a diagonally-touching cell (see the wayPoints interpolation
// for lines #0/#1/#3 below), so "adjacent...along" is read as consecutive
// along the drawn line, not necessarily sharing a grid edge.

const graph = cellGraph('9x9');

// Domino cages: cell pairs transcribed from the source's drawn cage list.
const dominoCages = [
  ['R2C2', 'R2C3'],
  ['R3C3', 'R3C4'],
  ['R1C5', 'R2C5'],
  ['R2C6', 'R3C6'],
  ['R2C8', 'R3C8'],
  ['R3C7', 'R4C7'],
  ['R5C8', 'R5C9'],
  ['R4C6', 'R5C6'],
  ['R4C4', 'R4C5'],
  ['R5C4', 'R6C4'],
  ['R6C5', 'R6C6'],
  ['R5C1', 'R5C2'],
  ['R4C2', 'R4C3'],
  ['R6C3', 'R7C3'],
  ['R7C4', 'R8C4'],
  ['R7C2', 'R8C2'],
  ['R8C5', 'R9C5'],
  ['R8C7', 'R8C8'],
  ['R7C6', 'R7C7'],
  ['R6C7', 'R6C8'],
];

// Every orthogonally-adjacent pair not already a cage: derived from the grid
// graph minus the cage edges above, rather than hand-enumerated. Grouped by
// offset (horizontal / vertical) and built with one Replicate per group,
// since the two offsets between them cover nearly every non-cage edge in
// the grid.
const cageEdgeKeys = new Set(
  dominoCages.map(([a, b]) => [a, b].sort().join('-')));
const notEleven = Pair.fnToKey((a, b) => a + b !== 11, 9);
const origin = graph.cells()[0]; // 'R1C1', matches SandboxCellGraph#makeReplicate's origin
const negativeDominoGroups = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const templateOther = graph.step(origin, dRow, dCol);
  const targets = graph.cells().filter(cell => {
    const other = graph.step(cell, dRow, dCol);
    return other && !cageEdgeKeys.has([cell, other].sort().join('-'));
  });
  return graph.makeReplicate(
    new Pair(notEleven, 'domino != 11', origin, templateOther), targets);
});

// Green lines: cell paths interpolated from the source's drawn line
// waypoints (polyline vertices, not one point per cell). A fifth drawn line
// entry has no coordinates -- styling only, not a drawn clue -- and is
// omitted.
const greenLines = [
  ['R1C2', 'R2C1', 'R2C2', 'R2C3', 'R2C4'],
  ['R4C7', 'R4C8', 'R5C9'],
  ['R8C1', 'R7C1', 'R7C2', 'R8C2', 'R8C3'],
  ['R8C9', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...dominoCages.map(cells => new Cage(11, ...cells)),
  ...negativeDominoGroups,
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
