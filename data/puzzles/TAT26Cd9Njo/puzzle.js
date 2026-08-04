// Title: Qi Manifest
// Author: Xendari
// Video: https://www.youtube.com/watch?v=TAT26Cd9Njo
// Source: https://app.crackingthecryptic.com/sudoku/Bfd43TJgMP

// Normal sudoku rules apply (default 3x3 boxes). Shade every cell one of two
// colours; each colour's cells must form a single orthogonally-connected
// region (one ConnectedValues per colour) and no 2x2 block may be entirely
// one colour (an NFA over the shade run, replicated to every 2x2 origin).
// Each drawn blue line must cross colours at least once, and every maximal
// same-colour run ("pass") it makes along its cells must sum to one common
// value N per line. One black dot is drawn, between R2C1 and R3C1: its two
// digits are in ratio 2:1. The rules say not every such dot is drawn, so no
// negative constraint is added for undrawn pairs.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either SHADED or UNSHADED.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// The rules never name the two colours, so swapping SHADED/UNSHADED
// everywhere yields the same puzzle with a relabelled aux overlay -- not a
// second solution the rules distinguish. Pin one cell to a canonical colour
// to remove that relabelling, rather than leave every solution duplicated.
const symmetryBreak = new Given(firstShade, SHADED);

// No 2x2 block may be all one colour: one NFA on the top-left block,
// replicated to every block origin. The state just remembers the run of
// shades seen so far (up to 4 cells) and rejects once all 4 match.
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

// Blue lines, transcribed in drawn order from the source (one degenerate
// drawn entry with no path was dropped).
const blueLines = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
  ['R1C3', 'R2C3', 'R3C2', 'R3C1'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R4C1', 'R5C1', 'R4C2'],
  ['R9C3', 'R8C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C3', 'R7C4', 'R8C5', 'R7C5', 'R7C6'],
  ['R7C7', 'R6C6', 'R6C5', 'R6C4', 'R5C4'],
  ['R4C6', 'R4C5', 'R5C5', 'R5C6'],
  ['R4C7', 'R3C6', 'R2C7', 'R2C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R5C7', 'R5C8', 'R6C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R7C8', 'R8C8', 'R8C7'],
];

// A blue line's "passes" are the maximal same-colour runs a walk along its
// cells makes. The rule requires every pass (of either colour) to sum to one
// common N, and at least one colour change along the line. Neither the break
// points nor N are known ahead of solving, so enumerate every non-trivial
// pattern of colour changes between consecutive line cells: mask bit i = 1
// means cells i/i+1 differ in colour. Each pattern becomes one branch of an
// Or -- an And of the shade (in)equalities the pattern requires, plus an
// EqualSum over the cell segments that pattern implies. Whatever the real
// shade assignment turns out to be, exactly one branch's shade conditions
// hold, and that branch is then the rule's actual sum-equality requirement.
function blueLineConstraint(lineCells) {
  const k = lineCells.length;
  const shadeCells = shade.at(lineCells);
  const branches = [];
  for (let mask = 1; mask < (1 << (k - 1)); mask++) {
    const clauses = [];
    const segments = [];
    let segStart = 0;
    for (let i = 0; i < k - 1; i++) {
      const differs = (mask >> i) & 1;
      clauses.push(differs
        ? new AllDifferent(shadeCells[i], shadeCells[i + 1])
        : new SameValues(2, shadeCells[i], shadeCells[i + 1]));
      if (differs) {
        segments.push(lineCells.slice(segStart, i + 1));
        segStart = i + 1;
      }
    }
    segments.push(lineCells.slice(segStart));
    branches.push(new And([...clauses, new EqualSum(...segments)]));
  }
  return new Or(branches);
}

// Black dot: drawn on the edge between R2C1 and R3C1 (source overlay #0,
// a filled edge mark at row-edge 2, column 0).
return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  symmetryBreak,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...blueLines.map(blueLineConstraint),
  new BlackDot('R2C1', 'R3C1'),
];
