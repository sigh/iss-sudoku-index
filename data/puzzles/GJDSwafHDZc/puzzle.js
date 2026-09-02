// Title: Tricolour shikadoku
// Author: Green_earthling
// Video: https://www.youtube.com/watch?v=GJDSwafHDZc
// Source: https://app.crackingthecryptic.com/sudoku/rPjGb2mJJB

// Normal sudoku applies. The grid is also divided into rectangular regions;
// every region holds exactly one circle, and the digit in that circle is the
// number of cells in the region. Digits do not repeat inside a region. A region
// takes the colour of its circle, and two regions of the same colour never
// share an orthogonal edge. A red circle holds the smallest digit of its
// region, a green circle the largest, a grey circle neither. Nothing is
// omitted.
//
// The partition is the solver's to find, so six overlays carry it, one value
// per grid cell:
//   VU, VD, VL, VR  how far this cell's rectangle continues up, down, left and
//                   right, held as (cells + 1) so the counts fit the 1-9 range.
//                   The rectangle of R{r}C{c} is rows r-U..r+D, cols c-L..c+R.
//   VS              that rectangle's cell count.
//   VK              that rectangle's colour: 1 red, 2 grey, 3 green.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();

const RED = 1, GREY = 2, GREEN = 3;

// The sixteen drawn discs, by fill colour: #e6261f red, #cfcfcf grey,
// #a3e048 green. All sixteen are empty circles, so each digit is the grid
// cell's own.
const CIRCLES = new Map([
  ['R1C1', RED], ['R4C1', RED], ['R6C1', RED],
  ['R6C7', RED], ['R3C9', RED], ['R9C3', RED],
  ['R8C7', GREY], ['R9C2', GREY], ['R3C1', GREY],
  ['R6C5', GREY], ['R5C6', GREY], ['R1C9', GREY],
  ['R3C6', GREEN], ['R5C5', GREEN], ['R9C7', GREEN], ['R8C3', GREEN],
]);

const up = graph.makeOverlay('VU');
const down = graph.makeOverlay('VD');
const leftOf = graph.makeOverlay('VL');
const rightOf = graph.makeOverlay('VR');
const size = graph.makeOverlay('VS');
const colour = graph.makeOverlay('VK');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// A rectangle may not run off the board, and every region has one of the three
// drawn colours.
const domains = cells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return [
    new Given(up.at(cell), ...range(1, row)),
    new Given(down.at(cell), ...range(1, 10 - row)),
    new Given(leftOf.at(cell), ...range(1, col)),
    new Given(rightOf.at(cell), ...range(1, 10 - col)),
  ];
}).concat(colour.makeReplicate(
  new Given(colour.cells()[0], RED, GREY, GREEN)));

// Rectangles are pinned by four local facts:
//   1. VL/VR cut every row into runs: VL counts up and VR counts down along a
//      run, and a run ends where VR reaches 0.
//   2. VU/VD cut every column into runs the same way.
//   3. Two cells sharing a row run agree on VU and VD.
//   4. Two cells sharing a column run agree on VL and VR.
// The first two are the pairs below; the second two ride along in the edge
// machine, which also carries the colour rule.

// b lies in a's run exactly when b's near-distance is non-zero, and then it is
// one further from that end than a is.
const chainNear = Pair.fnToKey((a, b) => b < 2 || b === a + 1, shape);
// Mirror image: while a is not the last cell of its run, b is one nearer the
// far end.
const chainFar = Pair.fnToKey((a, b) => a < 2 || b === a - 1, shape);
// The two cells agree on whether the edge between them is inside a rectangle.
const shareEdge = Pair.fnToKey((a, b) => (a >= 2) === (b >= 2), shape);

// Reads [far-distance of a, then the two cells' values for two fields that must
// agree inside a rectangle, then their colours]. `same` is set by the first
// value: a's rectangle continues into b exactly when a is not its last cell.
// Colours are equal inside a rectangle and different across a border, which is
// the same-colour no-touch rule.
const edgeSpec = NFA.encodeSpec({
  startState: { step: 0, same: false, prev: 0 },
  transition({ step, same, prev }, value) {
    switch (step) {
      case 0:
        return { step: 1, same: value >= 2, prev: 0 };
      case 1: case 3: case 5:
        return { step: step + 1, same, prev: value };
      case 2: case 4:
        if (same && value !== prev) return undefined;
        return { step: step + 1, same, prev: 0 };
      case 6:
        if (same !== (value === prev)) return undefined;
        return { step: 7, same: false, prev: 0 };
    }
    return undefined;
  },
  accept: ({ step }) => step === 7,
}, shape);

const rowEdges = cells.filter(cell => graph.step(cell, 0, 1))
  .map(a => [a, graph.step(a, 0, 1)]);
const colEdges = cells.filter(cell => graph.step(cell, 1, 0))
  .map(a => [a, graph.step(a, 1, 0)]);

// Fact 1: VL/VR cut each row into runs. The two chains are stamped across the
// whole overlay; the third pair, which straddles two overlays, is per edge.
const rowRuns = [
  leftOf.makeReplicate(
    new Pair(chainNear, '', leftOf.cells()[0], leftOf.at('R1C2')),
    rowEdges.map(([a]) => leftOf.at(a))),
  rightOf.makeReplicate(
    new Pair(chainFar, '', rightOf.cells()[0], rightOf.at('R1C2')),
    rowEdges.map(([a]) => rightOf.at(a))),
  ...rowEdges.map(([a, b]) => new Pair(shareEdge, '', rightOf.at(a), leftOf.at(b))),
];

// Fact 2: VU/VD cut each column into runs, the same way.
const colRuns = [
  up.makeReplicate(
    new Pair(chainNear, '', up.cells()[0], up.at('R2C1')),
    colEdges.map(([a]) => up.at(a))),
  down.makeReplicate(
    new Pair(chainFar, '', down.cells()[0], down.at('R2C1')),
    colEdges.map(([a]) => down.at(a))),
  ...colEdges.map(([a, b]) => new Pair(shareEdge, '', down.at(a), up.at(b))),
];

// Facts 3 and 4, and the colour rule, one machine per edge.
const edgeAgreement = [
  ...rowEdges.map(([a, b]) => new NFA(edgeSpec, 'row edge',
    rightOf.at(a),
    up.at(a), up.at(b), down.at(a), down.at(b),
    colour.at(a), colour.at(b))),
  ...colEdges.map(([a, b]) => new NFA(edgeSpec, 'column edge',
    down.at(a),
    leftOf.at(a), leftOf.at(b), rightOf.at(a), rightOf.at(b),
    colour.at(a), colour.at(b))),
];

// Reads [VU, VD, VL, VR, VS]: height times width is the cell count. The state
// carries the height, then the running area, so nothing unbounded is tracked.
const sizeSpec = NFA.encodeSpec({
  startState: { step: 0, height: 0, width: 0 },
  transition({ step, height, width }, value) {
    const d = value - 1;
    switch (step) {
      case 0:
        return { step: 1, height: d + 1, width: 0 };
      case 1: {
        const tall = height + d;
        return tall > 9 ? undefined : { step: 2, height: tall, width: 0 };
      }
      case 2:
        return { step: 3, height, width: d + 1 };
      case 3: {
        const area = height * (width + d);
        return area > 9 ? undefined : { step: 4, height: area, width: 0 };
      }
      case 4:
        return value === height ? { step: 5, height: 0, width: 0 } : undefined;
    }
    return undefined;
  },
  accept: ({ step }) => step === 5,
}, shape);

const areas = cells.map(cell => new NFA(
  sizeSpec, 'region size',
  up.at(cell), down.at(cell), leftOf.at(cell), rightOf.at(cell), size.at(cell)));

// One machine per cell, reading [VU, VD, VL, VR]: the rectangle those four
// distances describe must cover exactly one circle. The state holds the row
// span and the circles already counted in the columns up to this one, so the
// count never has to be carried as a set.
const circleRows = (r0, r1, col) => {
  let n = 0;
  for (const cell of CIRCLES.keys()) {
    const p = parseCellId(cell);
    if (p.col === col && p.row >= r0 && p.row <= r1) n++;
  }
  return n;
};

const oneCircleSpec = (row, col) => NFA.encodeSpec({
  startState: { step: 0, r0: 0, r1: 0, n: 0 },
  transition({ step, r0, r1, n }, value) {
    const d = value - 1;
    switch (step) {
      case 0:
        return d >= row ? undefined : { step: 1, r0: row - d, r1: 0, n: 0 };
      case 1: {
        const bottom = row + d;
        if (bottom > 9 || bottom - r0 + 1 > 9) return undefined;
        return { step: 2, r0, r1: bottom, n: 0 };
      }
      case 2: {
        if (d >= col) return undefined;
        let count = 0;
        for (let c = col - d; c <= col; c++) count += circleRows(r0, r1, c);
        return count > 1 ? undefined : { step: 3, r0, r1, n: count };
      }
      case 3: {
        if (col + d > 9) return undefined;
        let count = n;
        for (let c = col + 1; c <= col + d; c++) count += circleRows(r0, r1, c);
        return count === 1 ? { step: 4, r0: 0, r1: 0, n: 0 } : undefined;
      }
    }
    return undefined;
  },
  accept: ({ step }) => step === 4,
}, shape);

const oneCircle = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(oneCircleSpec(row, col), 'one circle',
    up.at(cell), down.at(cell), leftOf.at(cell), rightOf.at(cell));
});

// The circle's own digit is its region's cell count, and it fixes the region's
// colour.
const circleClues = [...CIRCLES].flatMap(([cell, tint]) => [
  new SameValues(2, size.at(cell), cell),
  new Given(colour.at(cell), tint),
]);

// Reads [VK, VS, digit]. In a red region the circle holds the smallest digit,
// so every other cell beats the region's size; in a green region every other
// cell is under it. Grey is left to the existential pairs below.
const extremeSpec = NFA.encodeSpec({
  startState: { step: 0, tint: 0, area: 0 },
  transition({ step, tint, area }, value) {
    switch (step) {
      case 0:
        return { step: 1, tint: value, area: 0 };
      case 1:
        return { step: 2, tint, area: value };
      case 2:
        if (tint === RED && value <= area) return undefined;
        if (tint === GREEN && value >= area) return undefined;
        return { step: 3, tint: 0, area: 0 };
    }
    return undefined;
  },
  accept: ({ step }) => step === 3,
}, shape);

const extremes = cells.filter(cell => !CIRCLES.has(cell)).map(cell => new NFA(
  extremeSpec, 'circle extreme', colour.at(cell), size.at(cell), cell));

// Digits do not repeat inside a region. Rows, columns and boxes already cover
// every same-region pair that shares one, so only pairs on different rows,
// different columns and different boxes are left. The reference cell is the
// upper one, and a rectangle holding both must reach dRow down and dCol across
// from it. A region has at most nine cells, which bounds the offsets.
const repeatSpec = (dRow, dCol) => NFA.encodeSpec({
  startState: { step: 0, inside: false, digit: 0 },
  transition({ step, inside, digit }, value) {
    const d = value - 1;
    switch (step) {
      case 0:
        return { step: 1, inside: d >= dRow, digit: 0 };
      case 1:
        return { step: 2, inside: inside && d >= dCol, digit: 0 };
      case 2:
        return { step: 3, inside, digit: inside ? value : 0 };
      case 3:
        if (inside && value === digit) return undefined;
        return { step: 4, inside: false, digit: 0 };
    }
    return undefined;
  },
  accept: ({ step }) => step === 4,
}, shape);

const repeatSpecs = new Map();
const boxOf = ({ row, col }) => ((row - 1) / 3 | 0) * 3 + ((col - 1) / 3 | 0);

const noRepeats = cells.flatMap(cell => {
  const p = parseCellId(cell);
  const out = [];
  for (let dRow = 1; dRow <= 3; dRow++) {
    for (let dCol = -3; dCol <= 3; dCol++) {
      if (dCol === 0) continue;
      if ((dRow + 1) * (Math.abs(dCol) + 1) > 9) continue;
      const other = graph.step(cell, dRow, dCol);
      if (!other) continue;
      if (boxOf(p) === boxOf(parseCellId(other))) continue;
      const key = `${dRow},${Math.abs(dCol)}`;
      if (!repeatSpecs.has(key)) {
        repeatSpecs.set(key, repeatSpec(dRow, Math.abs(dCol)));
      }
      // The across-distance is read from whichever side the other cell lies on.
      const across = dCol > 0 ? rightOf.at(cell) : leftOf.at(cell);
      out.push(new NFA(repeatSpecs.get(key), 'region repeat',
        down.at(cell), across, cell, other));
    }
  }
  return out;
});

// A grey circle holds neither extreme, so its region holds a smaller digit and
// a larger one. Each branch names one candidate cell, opens the circle's
// rectangle far enough to reach it, and compares the two digits.
const lessThan = Pair.fnToKey((a, b) => a < b, shape);
const greaterThan = Pair.fnToKey((a, b) => a > b, shape);

const reaches = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  const out = [];
  if (dRow > 0) out.push(new Given(down.at(cell), ...range(dRow + 1, 10 - row)));
  if (dRow < 0) out.push(new Given(up.at(cell), ...range(1 - dRow, row)));
  if (dCol > 0) out.push(new Given(rightOf.at(cell), ...range(dCol + 1, 10 - col)));
  if (dCol < 0) out.push(new Given(leftOf.at(cell), ...range(1 - dCol, col)));
  return out;
};

const greyBranches = (cell, key) => {
  const branches = [];
  for (let dRow = -8; dRow <= 8; dRow++) {
    for (let dCol = -8; dCol <= 8; dCol++) {
      if (dRow === 0 && dCol === 0) continue;
      if ((Math.abs(dRow) + 1) * (Math.abs(dCol) + 1) > 9) continue;
      const other = graph.step(cell, dRow, dCol);
      if (!other) continue;
      branches.push(new And([
        ...reaches(cell, dRow, dCol),
        new Pair(key, '', other, cell),
      ]));
    }
  }
  return new Or(branches);
};

const greyExtremes = [...CIRCLES]
  .filter(([, tint]) => tint === GREY)
  .flatMap(([cell]) => [
    greyBranches(cell, lessThan),
    greyBranches(cell, greaterThan),
  ]);

return [
  shape,
  up.toVar('up'), down.toVar('down'),
  leftOf.toVar('left'), rightOf.toVar('right'),
  size.toVar('size'), colour.toVar('colour'),
  new Given('R3C4', 9),
  new Given('R7C1', 1),
  ...domains,
  ...rowRuns,
  ...colRuns,
  ...edgeAgreement,
  ...areas,
  ...oneCircle,
  ...circleClues,
  ...extremes,
  ...noRepeats,
  ...greyExtremes,
];
