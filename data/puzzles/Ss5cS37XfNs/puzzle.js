// Title: An 18th Birthday Special!
// Author: Johtaja
// Video: https://www.youtube.com/watch?v=Ss5cS37XfNs
// Source: https://cracking-the-cryptic.web.app/sudoku/2JPFBJQTJ4

// Normal sudoku rules (standard 9x9, default row/column/box groups). No
// givens. On thermometers, digits increase from the bulb to the end(s).
// Outside arrows give the sum of the diagonal they point along. The
// right-edge cage sums to 18 with no printed total.

// Thermometer A: bulb at R8C2 (grey circle underlay), rising up column C2.
const thermoA = new Thermo(
  'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2');

// Thermometer B: a single bulb at R5C6 (the only other grey circle underlay)
// with four arms. The raw payload draws it as three strokes -- R5C7..R8C6,
// R5C7-R5C6-R5C5, and R2C5..R8C5 -- that meet at R5C7 and R5C5, each of which
// is itself a degree-3 junction rather than an endpoint. One Thermo per
// bulb-to-tip arm enforces "increase from the bulb" along every branch of
// the tree, per the rule text's "end(s)" plural.
const thermoB = [
  new Thermo('R5C6', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R2C6'),
  new Thermo('R5C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R8C6'),
  new Thermo('R5C6', 'R5C5', 'R4C5', 'R3C5', 'R2C5'),
  new Thermo('R5C6', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
];

// Outside diagonal-sum arrows. Each entry cell + direction is the cell the
// drawn arrow points into and the 45-degree direction it points, both read
// from the arrow's waypoints; graph.ray walks the diagonal from there.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const littleKillerRays = [
  ['R9C6', -1, 1],
  ['R4C1', 1, 1],
  ['R6C1', 1, 1],
  ['R7C1', 1, 1],
];
const littleKillers = littleKillerRays.map(
  ([entry, dRow, dCol]) =>
    LittleKiller.fromCells(18, graph.ray(entry, dRow, dCol), geometry));

// Right-edge cage; sum of 18 is stated only in the rules text, not printed
// on the cage.
const cage = new Cage(18, 'R5C9', 'R6C9', 'R7C9', 'R8C9');

return [
  new Shape('9x9'),
  thermoA,
  ...thermoB,
  ...littleKillers,
  cage,
];
