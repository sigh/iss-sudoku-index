// Title: Team Sum Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Bv7cGJW1d1c
// Source: https://sudokupad.app/21xzz0q3gd

// Normal 9x9 Sudoku. Split digits 1-9 into two unlabeled teams. Every maximal
// orthogonally connected same-team area has at most one displayed clue, and a
// clue equals the sum of all digits in its area; un-clued areas are allowed.

const TEAM_A = 1;
const TEAM_B = 2;
const CLUE_LABELS = 11;
const UNCLUED = CLUE_LABELS + 1;
const VALUE_COUNT = UNCLUED;
const DIGITS = Array.from({ length: 9 }, (_, i) => i + 1);
const LABELS = Array.from({ length: UNCLUED }, (_, i) => i + 1);

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const colour = graph.makeOverlay('VC');
const area = graph.makeOverlay('VL');
const digitTeams = new Var('T', 'team of digit 1 through 9', 9);
const teamCells = digitTeams.cells();

// The widened alphabet holds the two overlays' states. Main-grid cells remain
// digits 1-9; colour is 1 or 2, and area labels 1-11 name clued areas while
// label 12 represents any number of un-clued areas.
const gridDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));
const colourDomain = colour.makeReplicate(
  new Given(colour.cells()[0], TEAM_A, TEAM_B));
const areaDomain = area.makeReplicate(new Given(area.cells()[0], ...LABELS));
const teamDomain = teamCells.map(cell => new Given(cell, TEAM_A, TEAM_B));

// Each team-selection Var records the team of its numbered digit. Pinning the
// team of digit 1 only removes the arbitrary swap of the two otherwise unnamed
// teams. One Or branch per possible grid digit links the cell colour to that
// digit's shared team Var.
const digitTeamsMatchCells = gridCells.map(cell => new Or(DIGITS.map(digit => new And([
  new Given(cell, digit),
  new SameValues(2, teamCells[digit - 1], colour.at(cell)),
]))));

// Adjacent cells of the same team belong to the same area. A numbered label
// therefore cannot cross a same-team edge, and each numbered label has one
// connected component. The un-clued label deliberately permits disconnected
// components, because the rules allow areas without a clue.
const areaBoundaryMachine = NFA.encodeSpec({
  startState: { phase: 'label-a' },
  transition: (state, value) => {
    if (state.phase === 'label-a') return { phase: 'colour-a', labelA: value };
    if (state.phase === 'colour-a') return {
      phase: 'label-b', labelA: state.labelA, colourA: value,
    };
    if (state.phase === 'label-b') return {
      phase: 'colour-b', labelA: state.labelA, colourA: state.colourA, labelB: value,
    };
    const sameLabel = state.labelA === state.labelB;
    const sameColour = state.colourA === value;
    const valid = sameLabel
      ? state.labelA === UNCLUED || sameColour
      : !sameColour;
    return valid ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, VALUE_COUNT);
const areaBoundaries = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dr, dc]) => graph.step(cell, dr, dc))
  .filter(Boolean)
  .map(other => new NFA(areaBoundaryMachine, 'area boundary',
    area.at(cell), colour.at(cell), area.at(other), colour.at(other))));

// Each displayed clue pins a distinct area label. The NFA scans every
// (area-label, digit) pair and totals only its own label, rejecting a sum above
// the displayed total. ConnectedValues then makes each numbered label one area.
function areaSum(label, total) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, pendingLabel: null },
    transition: ({ sum, pendingLabel }, value) => {
      if (pendingLabel === null) return { sum, pendingLabel: value };
      const next = pendingLabel === label ? sum + value : sum;
      return next <= total ? { sum: next, pendingLabel: null } : undefined;
    },
    accept: ({ sum, pendingLabel }) => pendingLabel === null && sum === total,
  }, VALUE_COUNT);
  return new NFA(machine, `area sum ${total}`,
    ...gridCells.flatMap(cell => [area.at(cell), cell]));
}

// Hand-transcribed from the eleven displayed area-sum numbers in the source.
const clues = [
  ['R1C2', 14], ['R2C1', 17], ['R2C3', 9], ['R3C2', 9], ['R3C4', 6],
  ['R4C7', 17], ['R6C3', 8], ['R7C4', 10], ['R8C6', 4], ['R8C7', 4],
  ['R9C5', 19],
];

return [
  new Shape('9x9', VALUE_COUNT),
  colour.toVar('cell team'),
  area.toVar('area label'),
  digitTeams,
  gridDomain,
  colourDomain,
  areaDomain,
  ...teamDomain,
  new Given('VT1', TEAM_A),
  ...digitTeamsMatchCells,
  ...areaBoundaries,
  ...clues.map(([cell, total], i) => new Given(area.at(cell), i + 1)),
  ...clues.map(([, total], i) => areaSum(i + 1, total)),
  ...clues.map(([,], i) => new ConnectedValues('VL', i + 1)),
];
