// Title: Norinori Killer Sudoku
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=NCUveHxyZZo
// Source: https://app.crackingthecryptic.com/sudoku/qD34Tn6GBN

// Normal sudoku rules apply (default 9x9 grid, boxes, no givens). In cages,
// digits must sum to the small clue in the cage's top-left cell, and digits
// cannot repeat within a cage: a cage with a printed total gets Cage
// (sum + all-different); a cage with no printed total still gets the
// blanket all-different, per "digits cannot repeat within a cage".
// Cages are also subject to Norinori shading: shade exactly two cells per
// cage; each shaded cell is orthogonally adjacent to exactly one other
// shaded cell (this adjacency is over the whole grid, not scoped to the
// cage -- the rule never restricts it to same-cage cells); each shaded
// cell holds an odd digit.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Cages transcribed from the drawn cage geometry; they exactly partition
// all 81 cells. `total: null` cages printed no clue number in their corner
// but are still real cages, per the "digits cannot repeat within a cage"
// sentence applying to every cage.
const cages = [
  { total: 31, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4', 'R2C2'] },
  { total: 30, cells: ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7'] },
  { total: null, cells: ['R2C8', 'R2C9', 'R3C9', 'R4C9'] },
  { total: 16, cells: ['R5C9', 'R6C9', 'R7C9', 'R8C9'] },
  { total: null, cells: ['R2C1', 'R3C1', 'R4C1', 'R4C2'] },
  { total: null, cells: ['R2C3', 'R3C3', 'R3C2', 'R4C3', 'R3C4'] },
  { total: null, cells: ['R4C5', 'R3C5', 'R2C5', 'R2C6'] },
  { total: null, cells: ['R3C6', 'R5C6', 'R4C6', 'R3C7', 'R4C7', 'R5C7', 'R4C8', 'R3C8', 'R5C8'] },
  { total: null, cells: ['R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'] },
  { total: null, cells: ['R4C4', 'R5C4', 'R5C3', 'R5C5', 'R6C4'] },
  { total: 23, cells: ['R6C2', 'R7C2', 'R7C3', 'R6C3'] },
  { total: 17, cells: ['R8C2', 'R8C3', 'R8C4'] },
  { total: null, cells: ['R9C2', 'R9C3', 'R9C4'] },
  { total: 31, cells: ['R7C4', 'R6C5', 'R7C5', 'R8C5', 'R7C6'] },
  { total: null, cells: ['R6C6', 'R6C7', 'R6C8', 'R7C8'] },
  { total: 26, cells: ['R7C7', 'R8C7', 'R8C6', 'R9C6', 'R9C5'] },
  { total: 20, cells: ['R8C8', 'R9C8', 'R9C9', 'R9C7'] },
];

const cageConstraints = cages.map(({ total, cells }) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// Exactly two shaded cells per cage: with every VS cell restricted to
// {SHADED, UNSHADED} below, "value 1 occurs exactly twice" already forces
// the rest of the cage to UNSHADED.
const cageShading = cages.map(({ cells }) =>
  new ContainExact(`${SHADED}_${SHADED}`, ...shade.at(cells)));

// Restrict every VS cell to {SHADED, UNSHADED} via one Replicate template.
const originCell = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(originCell, SHADED, UNSHADED));

// Each shaded cell has exactly one shaded orthogonal neighbour; an unshaded
// cell is unconstrained by this rule. Reads a cell's own shade, then each
// in-grid neighbour's (2, 3, or 4 of them); count clamps and rejects past 1.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, shadedNeighbours }, value) => {
    if (phase === 'start') {
      return value === SHADED
        ? { phase: 'shaded', shadedNeighbours: 0 }
        : { phase: 'unshaded' };
    }
    if (phase === 'unshaded') return { phase: 'unshaded' };
    const count = shadedNeighbours + (value === SHADED ? 1 : 0);
    return count > 1 ? undefined : { phase: 'shaded', shadedNeighbours: count };
  },
  accept: ({ phase, shadedNeighbours }) => phase === 'unshaded' || shadedNeighbours === 1,
}, geometry.numValues);
const neighbourDegrees = graph.cells().map(cell => new NFA(
  degreeMachine, 'shaded-neighbour-count',
  ...shade.at([cell, ...graph.neighbours(cell)])));

// A shaded cell's digit is odd; an unshaded cell's digit is unrestricted.
const shadedOddKey = Pair.fnToKey(
  (shadeVal, digitVal) => shadeVal !== SHADED || digitVal % 2 === 1,
  geometry.numValues);
const shadedOdd = graph.cells().map(cell =>
  new Pair(shadedOddKey, 'shaded-odd', shade.at(cell), cell));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  ...cageConstraints,
  ...cageShading,
  ...neighbourDegrees,
  ...shadedOdd,
];
