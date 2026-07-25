// Title: Internal X-Sum Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=oRSz2HWoQQ8
// Source: https://sudokupad.app/ck24rsi50z

// Normal sudoku, plus Yin Yang shading (shaded cells form one orthogonally
// connected region, unshaded cells form one orthogonally connected region, no
// 2x2 area is monochrome), plus Internal X-Sum clues: the digit in a marked
// cell is the total count of cells of its own shading visible from it along
// its row and column combined (including itself, blocked by the opposite
// shading or the grid edge), and those cells sum to the clue's target.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Every rule below treats "shaded" and "unshaded" symmetrically (the X-Sum
// clues read "the same shading as itself", never a named colour), so the
// swap of the two labels over the whole grid is always a second, redundant
// solution to this encoding with an identical digit grid. Pin one cell's
// label to remove that solver-internal duplicate; it cannot exclude the
// true digit grid, since swapping the labels never changes it.
const pinShadeLabel = new Given(firstShade, SHADED);

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const geometry = graph.gridGeometry();
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
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(blockOrigins));

// Windows of a line (row or column) that contain `index` and are bounded, on
// each side that is still inside the grid, by the opposite shade. Returns the
// Given/shade constraints for one such window at a given shade.
function windowConstraints(lineCells, start, end, targetShade) {
  const blocker = targetShade === SHADED ? UNSHADED : SHADED;
  const cs = [];
  for (let i = start; i <= end; i++) {
    cs.push(new Given(shade.at(lineCells[i]), targetShade));
  }
  if (start > 0) {
    cs.push(new Given(shade.at(lineCells[start - 1]), blocker));
  }
  if (end + 1 < lineCells.length) {
    cs.push(new Given(shade.at(lineCells[end + 1]), blocker));
  }
  return cs;
}

function windows(length, index) {
  const result = [];
  for (let start = 0; start <= index; start++) {
    for (let end = index; end < length; end++) {
      result.push({ start, end });
    }
  }
  return result;
}

// The clue's own shade, and the run in each of the four directions from it,
// are all unknown, so enumerate every combination: a shade for the clue cell,
// a same-shade row window through it (bounded by the opposite shade or the
// row's edge), and a same-shade column window through it. The combined count
// (row window length + column window length - 1, since the clue cell is
// shared) is pinned to the clue's own digit, and the combined sum (row window
// + column window, with the shared clue cell counted once) is pinned to the
// clue's target.
function internalXSum(cell, target) {
  const { row, col } = parseCellId(cell);
  const rowCells = graph.row(cell);
  const colCells = graph.column(cell);
  const rowIndex = col - 1;
  const colIndex = row - 1;

  const options = [];
  for (const targetShade of [SHADED, UNSHADED]) {
    for (const hw of windows(rowCells.length, rowIndex)) {
      for (const vw of windows(colCells.length, colIndex)) {
        const hLen = hw.end - hw.start + 1;
        const vLen = vw.end - vw.start + 1;
        // The clue cell is shared by both windows, so the combined count is
        // hLen + vLen - 1. Skip combinations outside the 1-9 digit domain.
        const count = hLen + vLen - 1;
        if (count < 1 || count > 9) continue;
        const hCells = rowCells.slice(hw.start, hw.end + 1);
        const vCells = colCells.slice(vw.start, vw.end + 1);
        options.push(new And([
          new Given(cell, count),
          // hCells and vCells both include `cell`; subtract it once so it is
          // only counted once in the total.
          new Sum(target, ...hCells, ...vCells, [cell, -1]),
          ...windowConstraints(rowCells, hw.start, hw.end, targetShade),
          ...windowConstraints(colCells, vw.start, vw.end, targetShade),
        ]));
      }
    }
  }
  return new Or(options);
}

// Internal X-Sum clue cell -> target sum, read from the corner numbers.
const clues = {
  'R1C3': 45,
  'R1C4': 45,
  'R2C8': 43,
  'R3C7': 5,
  'R4C5': 26,
  'R5C1': 46,
  'R5C3': 33,
  'R5C7': 24,
  'R7C4': 16,
  'R8C5': 30,
};

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  pinShadeLabel,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...Object.entries(clues).map(([cell, target]) => internalXSum(cell, target)),
];
