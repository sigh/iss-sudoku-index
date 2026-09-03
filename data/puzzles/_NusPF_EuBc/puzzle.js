// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_NusPF_EuBc
// Source: https://git.io/JThsd

// Rules encoded below, in full; nothing is omitted.
//
// Normal sudoku rules apply.
// Cells separated by a small white dot are consecutive.
// Hashiwokakero rules apply, ie: draw lines between the circles such that all
// circles are connected; the lines must be drawn in straight lines that are
// horizontal or vertical, and that do not cross any other lines or circles;
// at most two lines can connect a pair of circles; the number of lines
// connected to each circle must match the digit on that circle.
//
// The circles carry no printed number, so "the digit on that circle" is the
// sudoku digit of the cell the circle sits in. The grid has no givens.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The 32 drawn circles, in reading order.
const circles = [
  'R1C4', 'R1C6', 'R1C8',
  'R2C2', 'R2C3', 'R2C5', 'R2C7',
  'R3C2', 'R3C4', 'R3C6', 'R3C8',
  'R4C1', 'R4C7',
  'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C1', 'R6C6', 'R6C7',
  'R7C3',
  'R8C4', 'R8C6', 'R8C7', 'R8C8',
  'R9C4', 'R9C6', 'R9C7',
];
const isCircle = new Set(circles);

// The 2 drawn white dots, as the cell pairs their border segments separate.
const whiteDots = [['R3C3', 'R4C3'], ['R9C2', 'R9C3']];

// A line runs straight along a row or column and may not cross a circle, so the
// only joinable pairs are circles that are consecutive along their row or
// column; `between` is the run of cells the line would cover.
const bridgesAlong = (line) => {
  const onLine = line.filter(cell => isCircle.has(cell));
  return onLine.slice(0, -1).map((a, i) => {
    const b = onLine[i + 1];
    return { a, b, between: line.slice(line.indexOf(a) + 1, line.indexOf(b)) };
  });
};
const rowBridges = graph.rows().flatMap(bridgesAlong);
const colBridges = graph.columns().flatMap(bridgesAlong);
const bridges = [...rowBridges, ...colBridges];

// One Var per joinable pair, holding how many lines join it:
// 1 = none, 2 = one line, 3 = two lines ("at most two lines can connect a
// pair of circles" is the domain).
const NO_LINE = 1;
const LINE_VALUES = [1, 2, 3];
const bridgeVar = new Var('B', 'lines per circle pair', bridges.length);
const bridgeCell = i => bridgeVar.cell(i + 1);

const incident = new Map(circles.map(cell => [cell, []]));
bridges.forEach((bridge, i) => {
  incident.get(bridge.a).push(i);
  incident.get(bridge.b).push(i);
});

// Line count at a circle equals its digit: the incident Vars sum to the digit
// plus one per incident Var, the offset that turns 1/2/3 into 0/1/2 lines.
const circleDegrees = circles.map(cell => {
  const cells = incident.get(cell).map(bridgeCell);
  return new Sum(cells.length, ...cells, [cell, -1]);
});

// Lines do not cross: a perpendicular pair whose runs share a cell cannot both
// be drawn, so at least one of the two Vars holds NO_LINE.
const notBothDrawn = Pair.fnToKey((a, b) => a === NO_LINE || b === NO_LINE, shape);
const crossings = rowBridges.flatMap((h, i) =>
  colBridges.flatMap((v, j) =>
    h.between.some(cell => v.between.includes(cell))
      ? [new Pair(notBothDrawn, 'no crossing',
        bridgeCell(i), bridgeCell(rowBridges.length + j))]
      : []));

// All circles are connected. Two Var layers carry a base-6 depth per circle,
// depth = 6*(VH - 1) + (VL - 1), covering 0..35 -- a spanning tree over 32
// circles reaches at most 31. The first circle in reading order is the root at
// depth 0; every other circle needs a drawn line to a circle one shallower, and
// no drawn line may change the depth by more than one. The first of those makes
// the depths a chain of drawn lines back to the root, which is connectivity;
// the two together make each depth the number of lines on a shortest such
// chain, so the layers add no freedom of their own.
const high = graph.makeOverlay('VH', circles);
const low = graph.makeOverlay('VL', circles);
const DEPTH_DIGITS = [1, 2, 3, 4, 5, 6];
const root = circles[0];
const depthDiff = (x, y, delta) => new Sum(
  delta, [high.at(x), 6], [low.at(x), 1], [high.at(y), -6], [low.at(y), -1]);

const rootDepth = [new Given(high.at(root), 1), new Given(low.at(root), 1)];
const towardsRoot = circles.filter(cell => cell !== root).map(cell =>
  new Or(incident.get(cell).map(i => {
    const nearer = bridges[i].a === cell ? bridges[i].b : bridges[i].a;
    return new And([
      new Given(bridgeCell(i), 2, 3),
      depthDiff(nearer, cell, -1),
    ]);
  })));
const depthSteps = bridges.map((bridge, i) => new Or([
  new Given(bridgeCell(i), NO_LINE),
  ...[-1, 0, 1].map(delta => depthDiff(bridge.a, bridge.b, delta)),
]));

return [
  shape,
  bridgeVar,
  high.toVar('depth, sixes'),
  low.toVar('depth, units'),
  ...bridges.map((_, i) => new Given(bridgeCell(i), ...LINE_VALUES)),
  ...circles.flatMap(cell => [
    new Given(high.at(cell), ...DEPTH_DIGITS),
    new Given(low.at(cell), ...DEPTH_DIGITS),
  ]),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...circleDegrees,
  ...crossings,
  ...rootDepth,
  ...towardsRoot,
  ...depthSteps,
];
