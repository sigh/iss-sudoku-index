// Title: Shanghai Skyline
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=CswmNRhF7W8
// Source: https://sudokupad.app/6hc3f9hbqu

// Yin-Yang shading is stored in VS: 1 is shaded and 2 is unshaded.
// Each outside clue scans alternating grid digits and shade flags, counting
// record-high digits only when their flag is shaded.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

const noMono2x2Machine = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values, done }, value) => {
    if (done) return { done: true };
    const next = [...values, value];
    if (next.length < 4) return { values: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

const dots = [
  ['R2C3', 'R2C4'],
  ['R3C7', 'R3C8'],
  ['R4C3', 'R5C3'],
  ['R6C6', 'R6C7'],
  ['R8C4', 'R8C5'],
];
const dotRules = dots.flatMap(([a, b]) => [
  new BlackDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

const views = [
  { clue: 1, cells: graph.row('R1C1') },
  { clue: 1, cells: graph.row('R1C1').toReversed() },
  { clue: 5, cells: graph.row('R2C1') },
  { clue: 1, cells: graph.row('R2C1').toReversed() },
  { clue: 4, cells: graph.row('R3C1') },
  { clue: 3, cells: graph.row('R6C1') },
  { clue: 3, cells: graph.row('R6C1').toReversed() },
  { clue: 4, cells: graph.row('R8C1') },
  { clue: 1, cells: graph.row('R9C1') },
  { clue: 1, cells: graph.row('R9C1').toReversed() },
  { clue: 3, cells: graph.column('R1C2') },
  { clue: 3, cells: graph.column('R1C5') },
  { clue: 5, cells: graph.column('R1C8') },
  { clue: 4, cells: graph.column('R1C4').toReversed() },
  { clue: 1, cells: graph.column('R1C6').toReversed() },
  { clue: 4, cells: graph.column('R1C7').toReversed() },
];

function visibilityMachine(clue) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', tallest: 0, visible: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', digit: value };
      }
      const isVisible = value === SHADED && state.digit > state.tallest;
      const visible = state.visible + (isVisible ? 1 : 0);
      if (visible > clue) return undefined;
      return {
        phase: 'digit',
        tallest: value === SHADED
          ? Math.max(state.tallest, state.digit) : state.tallest,
        visible,
      };
    },
    accept: state => state.phase === 'digit' && state.visible === clue,
  }, geometry.numValues);
}

const visibilityMachines = new Map(
  [...new Set(views.map(({ clue }) => clue))]
    .map(clue => [clue, visibilityMachine(clue)]));
const skyscraperRules = views.map(({ clue, cells }) => {
  const digitShadePairs = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(
    visibilityMachines.get(clue), `shaded-skyscrapers-${clue}`,
    ...digitShadePairs);
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Given('R1C5', 1),
  new Given('R7C9', 6),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...dotRules,
  ...skyscraperRules,
];
