// Title: Stranger in a Strange Land
// Author: Wuschel
// Video: https://www.youtube.com/watch?v=PAAS013jMOM
// Source: https://sudokupad.app/hqyaharmuk

// Normal sudoku rules apply (rows, columns, boxes all-different, digits 1-9).
// Fog is solving UI and is not encoded.
//
// Shade some cells: shaded cells and unshaded cells each form one
// orthogonally connected region, and no 2x2 area is fully shaded or fully
// unshaded (Yin-Yang-style shading below).
//
// Every cell has a derived "value": one more than its digit when shaded, one
// less when unshaded. The grid is widened to 0-10 so "value" (0-10) fits
// alongside the real digits (1-9); a Var overlay per shade flag ties value to
// digit and shade with a linear Sum.
//
// Box borders split each blue line into segments; the value-sum is equal
// across a line's own segments (independently per line -- lines are not
// compared to each other). Black dots: one value is double the other. White
// dots: values differ by 1. "Not all dots are necessarily given" -- only the
// drawn dots constrain anything; undotted adjacent pairs carry no implied
// negative.
//
// One of the five lines (the small loop at the R6/R7-C3/C4 box corner) is
// omitted below: it is marked `omit: true` where it is defined, with the
// reasoning next to it.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9~0-10');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const shade = graph.makeOverlay('VS');
const value = graph.makeOverlay('VV');

// Real grid cells keep the true Sudoku digit range; the widened 0-10 range
// exists only so "value" can hold 0 and 10. Replicate one Given(1..9) across
// every grid cell rather than restricting each by hand.
const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Every shade Var is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// value = digit + 1 when shaded, digit - 1 when unshaded:
//   value - digit + 2*shade = 3  (shade=SHADED=1 -> value=digit+1;
//                                  shade=UNSHADED=2 -> value=digit-1)
const valueLinks = gridCells.map(cell =>
  new Sum(3, value.at(cell), [cell, -1], [shade.at(cell), 2]));

// Yin-Yang shading: each shade forms one orthogonally connected region.
const connectivity = [
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
];

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// 2x2 block, replicated to every 2x2 block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// White/black dots, from the drawn edge circles (repeated edge-circle marks
// in the geometry summary). Each pair is orthogonally adjacent.
const whiteDotPairs = [
  ['R9C2', 'R9C3'], ['R9C1', 'R9C2'], ['R8C1', 'R9C1'], ['R7C1', 'R8C1'],
  ['R1C2', 'R2C2'], ['R1C2', 'R1C3'], ['R1C3', 'R2C3'], ['R2C2', 'R2C3'],
  ['R1C5', 'R2C5'], ['R2C5', 'R3C5'],
];
const blackDotPairs = [
  ['R2C7', 'R2C8'], ['R6C2', 'R7C2'], ['R4C2', 'R5C2'], ['R4C7', 'R5C7'],
  ['R7C6', 'R7C7'],
];
const whiteDots = whiteDotPairs.map(
  ([a, b]) => new WhiteDot(value.at(a), value.at(b)));
const blackDots = blackDotPairs.map(
  ([a, b]) => new BlackDot(value.at(a), value.at(b)));

// Blue sum lines, cell paths from the geometry summary (closed loops repeat
// their first cell at the end).
const lines = [
  { cells: ['R9C7', 'R9C6', 'R8C7', 'R7C8'], closed: false },
  { cells: ['R6C8', 'R6C7', 'R5C6', 'R4C5', 'R4C4', 'R3C3', 'R3C2'], closed: false },
  // This loop sits at the meeting corner of four boxes, so every cell is in
  // its own box: box-splitting gives four single-cell segments, requiring
  // all four cells to share one value. That is rejected by the known
  // solution (omitted below, not encoded).
  { cells: ['R6C3', 'R6C4', 'R7C4', 'R7C3', 'R6C3'], closed: true, omit: true },
  { cells: ['R7C3', 'R8C3', 'R8C2', 'R7C2', 'R7C3'], closed: true },
  {
    cells: [
      'R3C9', 'R4C8', 'R4C7', 'R4C6', 'R3C6', 'R2C6',
      'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9',
    ],
    closed: true,
  },
];

const boxOfCell = new Map();
graph.boxes().forEach((box, i) => { for (const c of box) boxOfCell.set(c, i); });

// Split a line's ordered cells into maximal runs sharing one box. For a
// closed loop, also merge the run that wraps across the closing edge back
// into the run it lands on, since the two are one continuous run on the
// line, not two.
function boxSegments({ cells, closed }) {
  const path = closed && cells[0] === cells[cells.length - 1]
    ? cells.slice(0, -1) : cells;
  const segments = [[path[0]]];
  for (let i = 1; i < path.length; i++) {
    if (boxOfCell.get(path[i]) === boxOfCell.get(path[i - 1])) {
      segments[segments.length - 1].push(path[i]);
    } else {
      segments.push([path[i]]);
    }
  }
  if (closed && segments.length > 1 &&
    boxOfCell.get(path[0]) === boxOfCell.get(path[path.length - 1])) {
    segments[segments.length - 1].push(...segments.shift());
  }
  return segments;
}

// The R7C3-R8C3-R8C2-R7C2 loop lies entirely inside one box (the
// bottom-left box), so it never crosses a box border: boxSegments returns a
// single segment there, and the "equal sum per segment" rule contributes no
// constraint for it. That is what the rule computes to, not a dropped clause.
const sumLines = lines.filter(line => !line.omit).flatMap(line => {
  const segments = boxSegments(line);
  if (segments.length < 2) return [];
  return [new EqualSum(...value.at(segments))];
});

return [
  new Shape('9x9', '0-10'),
  shade.toVar('shade'),
  value.toVar('value'),
  digitDomain,
  shadeDomain,
  ...valueLinks,
  ...connectivity,
  noMono2x2,
  ...whiteDots,
  ...blackDots,
  ...sumLines,
];
