// Title: Heyawake Sudoku
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=Vdo0q1Btds4
// Source: https://app.crackingthecryptic.com/sudoku/jgFjmHD7bb

// Normal sudoku rules apply, plus a Heyawake-style shading overlay held in a
// parallel Var layer (every cell keeps its ordinary sudoku digit regardless
// of shade). Shaded cells may never be orthogonally adjacent to another
// shaded cell (one Pair per grid edge). The unshaded cells must form one
// orthogonally-connected area (ConnectedValues over the shade overlay).
//
// Omitted: each box carries a plain circle with no digit or text recorded
// anywhere in the source payload (no `overlays` array; every grid cell is
// `{}`), so the "circle gives the box's required shaded-cell count" rule
// cannot be decoded and is not encoded.
//
// A contiguous unshaded run cannot span two box borders in a row or column.
// With borders after column/row 3 and after column/row 6, a run only crosses
// both borders by covering the whole band between them -- i.e. by containing
// columns (or rows) 3,4,5,6,7 all at once -- so this reduces to: every row
// and every column has at least one shaded cell among its middle five
// (columns/rows 3-7).
//
// Cage digits may not repeat (AllDifferent over every listed cell, including
// shaded ones -- the rule's exception names only "the total", not the
// repeat check; an alternative reading excludes shaded cells from the
// repeat check too, but is not the more literal reading of the text).
// The cage total counts only unshaded cells: one interleaved-scan NFA per
// cage reads (digit, shade, digit, shade, ...) and adds a cell's digit to
// the running sum only when that cell's shade reads UNSHADED.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// "Shaded cells cannot share an edge with each other": one Pair template per
// direction (rightward, downward), each replicated to every origin whose
// neighbour in that direction is still on the grid -- covers every edge once.
const gridCells = graph.cells();
const noAdjacentShadedKey = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), geometry.numValues);
const rightOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const downOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const rightTemplate = new Pair(noAdjacentShadedKey, '',
  ...shade.at([gridCells[0], graph.step(gridCells[0], 0, 1)]));
const downTemplate = new Pair(noAdjacentShadedKey, '',
  ...shade.at([gridCells[0], graph.step(gridCells[0], 1, 0)]));
const noAdjacentShaded = [
  shade.makeReplicate(rightTemplate, shade.at(rightOrigins)),
  shade.makeReplicate(downTemplate, shade.at(downOrigins)),
];

// Row/column border-span rule (see header derivation above).
const band = [3, 4, 5, 6, 7];
const rowBandRules = graph.rows().map(row => new Or(
  band.map(c => new Given(shade.at(row[c - 1]), SHADED))));
const colBandRules = graph.columns().map(col => new Or(
  band.map(r => new Given(shade.at(col[r - 1]), SHADED))));

// Cages: [cells, total]. Coordinates transcribed from the `cages` array.
const cages = [
  [['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'], 11],
  [['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'], 32],
  [['R1C4', 'R2C3', 'R2C4', 'R2C5'], 3],
  [['R3C1', 'R3C2', 'R3C3', 'R3C4'], 3],
  [['R7C6', 'R7C7', 'R7C8', 'R7C9'], 17],
  [['R1C5', 'R1C6', 'R2C6'], 16],
  [['R1C1', 'R1C2'], 9],
  [['R4C3', 'R5C2', 'R5C3'], 24],
  [['R5C1', 'R6C1', 'R6C2', 'R6C3'], 9],
  [['R5C7', 'R5C8', 'R6C7'], 7],
  [['R4C8', 'R4C9', 'R5C9'], 15],
  [['R8C4', 'R9C3', 'R9C4', 'R9C5'], 13],
  [['R8C6', 'R8C7', 'R8C8', 'R9C7'], 6],
  [['R9C8', 'R9C9'], 9],
  [['R8C1', 'R8C2', 'R9C2'], 20],
  [['R7C1', 'R7C2'], 4],
  [['R7C3', 'R7C4', 'R8C3'], 13],
];

// Digits in a cage may not repeat -- over every listed cell (see header).
// Skip the two cages that are exactly a whole box (box 5, box 3): the
// engine's own box all-different already covers all nine cells there.
const cageDistinct = cages
  .filter(([cells]) => !graph.boxes().some(
    box => box.length === cells.length && box.every(c => cells.includes(c))))
  .map(([cells]) => new AllDifferent(...cells));

// Shaded cells contribute nothing to the cage total: scan (digit, shade)
// pairs and accumulate the digit only when its cell reads UNSHADED.
function cageSumSpec(total) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: ({ phase, sum, pending }, value) => {
      if (phase === 'digit') return { phase: 'shade', sum, pending: value };
      const add = value === UNSHADED ? pending : 0;
      const next = sum + add;
      if (next > total) return undefined; // sum only grows; prune overshoot
      return { phase: 'digit', sum: next };
    },
    accept: ({ phase, sum }) => phase === 'digit' && sum === total,
  }, geometry.numValues);
}
const cageSums = cages.map(([cells, total], i) => new NFA(
  cageSumSpec(total), `cage${i}-sum`,
  ...cells.flatMap(cell => [cell, shade.at(cell)])));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', UNSHADED),
  ...noAdjacentShaded,
  ...rowBandRules,
  ...colBandRules,
  ...cageDistinct,
  ...cageSums,
];
