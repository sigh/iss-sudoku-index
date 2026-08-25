// Title: Quadro Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Fmu7Q-LwGmY
// Source: https://sudokupad.app/2dpL9GLQnB

// Normal sudoku rules apply. Additionally, every 2x2 block of orthogonally
// adjacent cells must contain at least one odd digit and at least one even
// digit. "Every 2x2 adjacent cells" is read as every overlapping 2x2 window
// on the grid (8x8 = 64 windows), matching how the built-in GlobalEntropy/
// GlobalMod constraints treat the same phrase for their own per-window rules.

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
  new Given('R1C1', 6), new Given('R1C4', 2), new Given('R1C9', 1),
  new Given('R2C3', 1), new Given('R2C5', 3), new Given('R2C7', 4),
  new Given('R3C2', 9), new Given('R3C6', 5), new Given('R3C8', 6),
  new Given('R4C3', 6), new Given('R4C9', 8),
  new Given('R5C2', 4), new Given('R5C5', 5), new Given('R5C8', 7),
  new Given('R6C1', 2), new Given('R6C7', 9),
  new Given('R7C2', 6), new Given('R7C4', 1), new Given('R7C8', 4),
  new Given('R8C3', 5), new Given('R8C5', 7), new Given('R8C7', 6),
  new Given('R9C1', 7), new Given('R9C6', 8), new Given('R9C9', 3),
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
