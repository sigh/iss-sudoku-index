// Title: Quadro Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=IRJsYKoy3nE
// Source: https://tinyurl.com/4jh98hsz

// Normal sudoku rules apply. Additionally, no 2x2 area of the grid may
// contain all odd digits or all even digits -- equivalently, every 2x2
// area must contain at least one odd digit and at least one even digit.
// "Every 2x2 area" is read as every overlapping 2x2 window on the grid
// (8x8 = 64 windows), matching how the built-in GlobalEntropy/GlobalMod
// constraints treat the same phrase for their own per-window rules.

// Tracks whether an odd and an even digit have been seen among a window's
// four cells; order does not matter since the rule is symmetric in the
// cells. Accept only once both parities have appeared.
const oddEvenSpec = NFA.encodeSpec({
  startState: { odd: false, even: false },
  transition: (state, value) => {
    const isOdd = value % 2 === 1;
    return { odd: state.odd || isOdd, even: state.even || !isOdd };
  },
  accept: (state) => state.odd && state.even,
}, 9);

const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Givens transcribed from the payload's cell grid.
const givens = [
  new Given('R1C1', 1), new Given('R1C2', 3), new Given('R1C8', 2),
  new Given('R2C1', 5), new Given('R2C8', 4), new Given('R2C9', 6),
  new Given('R3C3', 9), new Given('R3C4', 3), new Given('R3C6', 6),
  new Given('R4C3', 5), new Given('R4C6', 8),
  new Given('R5C5', 7),
  new Given('R6C4', 6), new Given('R6C7', 7),
  new Given('R7C4', 8), new Given('R7C6', 1), new Given('R7C7', 9),
  new Given('R8C1', 4), new Given('R8C2', 6), new Given('R8C9', 5),
  new Given('R9C2', 2), new Given('R9C8', 3), new Given('R9C9', 7),
];

// Every overlapping 2x2 window of the 9x9 grid shares one shifted template
// (top-left at R1C1, covering R1C1/R1C2/R2C1/R2C2), replicated to every
// top-left position R1C1..R8C8 (r, c in 1..8) via Replicate.
const graph = cellGraph('9x9');
const origin = 'R1C1';
const oddEvenTemplate = [
  new NFA(oddEvenSpec, 'at least one odd and one even', 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
];
const windowOrigins = [];
for (const r of indices.slice(0, 8)) {
  for (const c of indices.slice(0, 8)) {
    windowOrigins.push(makeCellId(r, c));
  }
}
const oddEvenWindows = new Replicate(
  oddEvenTemplate,
  Replicate.encodeTargetCells(windowOrigins, origin, graph),
  origin,
);

return [
  new Shape('9x9'),
  ...givens,
  oddEvenWindows,
];
