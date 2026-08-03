// Title: Babbling Brook
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=tNnSaQb2MP4
// Source: https://app.crackingthecryptic.com/sudoku/dh9t3PnBQ4

// Standard 9x9 sudoku. The grid is shaded with two colours (SHADED/UNSHADED):
// each colour forms one orthogonally-connected region, and no 2x2 block may be
// one colour (ConnectedValues per colour, plus a replicated no-mono-2x2 NFA
// over a shade overlay). Every blue line is split, in its drawn order, into
// maximal runs of matching shade; every run on a line must sum to the same
// value N, with N free per line. A line that ends up entirely one colour
// has only one run and is
// rejected by construction, which is also "all lines must cross colours at
// least once". Runs are enumerated as an Or over every non-constant
// two-colouring of the line's cells (a running-sum NFA against an unknown
// per-line target blows the state cap for the 9-cell line), each branch
// pinning that colouring via Given and asserting EqualSum over its runs.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all one colour: one NFA on the top-left block,
// replicated to every block origin (states: the shades seen so far in the
// block; done once a mismatch is found).
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
}, graph.gridGeometry().numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Blue lines, transcribed in drawn waypoint order (deepskyblue strokes).
// Consecutive cells in a line may be diagonal on the grid -- lines bind by
// list order, not grid adjacency.
const blueLines = [
  ['R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8'],
  ['R1C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3'],
  ['R2C9', 'R2C8', 'R3C7'],
  ['R3C6', 'R4C7', 'R4C6'],
  ['R1C2', 'R2C2', 'R2C3'],
  ['R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R8C8', 'R9C7', 'R9C6'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R8C2'],
  ['R8C6', 'R8C5', 'R8C4'],
  ['R5C5', 'R6C5', 'R6C4'],
];

// For one line, enumerate every non-constant assignment of SHADED/UNSHADED to
// its cells (excluding the two constant ones -- a line all one colour never
// crosses colours), split each assignment into its maximal same-colour runs,
// and require the runs to share one sum. Only the branch matching the true
// shading of the grid can hold; every other branch is contradicted by its own
// Given cells.
function equalSumPerColourRun(cells) {
  const n = cells.length;
  const branches = [];
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const colours = Array.from(
      { length: n }, (_, i) => ((mask >> i) & 1) ? SHADED : UNSHADED);
    const runs = [[cells[0]]];
    for (let i = 1; i < n; i++) {
      if (colours[i] === colours[i - 1]) runs[runs.length - 1].push(cells[i]);
      else runs.push([cells[i]]);
    }
    branches.push(new And([
      ...cells.map((cell, i) => new Given(shade.at(cell), colours[i])),
      new EqualSum(...runs),
    ]));
  }
  return new Or(branches);
}

// Overlay text "X" sits on the edge between R1C1 and R2C1.
const xClue = new X('R1C1', 'R2C1');

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...blueLines.map(equalSumPerColourRun),
  xClue,
];
