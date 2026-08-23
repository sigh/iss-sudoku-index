// Title: Yin Yang FSOE
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=izvJhyG8ZN8
// Source: https://sudokupad.app/pyunvd8iy4

// The YY overlay records the YinYang shading. Each FSOE NFA scans digit/shade
// pairs and branches over which shade that particular clue sees.

const SHADE_A = 1;
const SHADE_B = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const firstShade = shade.cells()[0];

// Scan alternating digit and shade cells. Before the first shade is read, the
// machine branches over the colour seen by this clue. Digits of the other
// colour and same-colour digits of the opposite parity are ignored. The first
// same-colour digit of the clue's parity must equal the clue.
function firstSeenMachine(clue) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', target: 0, found: false },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        const next = target => ({
          phase: 'shade', target, found: state.found, digit: value,
        });
        return state.target === 0
          ? [next(SHADE_A), next(SHADE_B)]
          : next(state.target);
      }

      if (state.found) {
        return { phase: 'digit', target: state.target, found: true };
      }
      const matchesParity = state.digit % 2 === clue % 2;
      if (value === state.target && matchesParity) {
        return state.digit === clue
          ? { phase: 'digit', target: state.target, found: true }
          : undefined;
      }
      return { phase: 'digit', target: state.target, found: false };
    },
    accept: state => state.phase === 'digit' && state.found,
  }, geometry.numValues);
}

const machines = new Map(
  Array.from({ length: 9 }, (_, index) => index + 1)
    .map(clue => [clue, firstSeenMachine(clue)]));

const clueDefs = [
  // Left and right clues.
  { clue: 1, cells: graph.row('R1C1') },
  { clue: 2, cells: graph.row('R1C1') },
  { clue: 1, cells: graph.row('R2C1') },
  { clue: 5, cells: graph.row('R2C1') },
  { clue: 2, cells: graph.row('R3C1') },
  { clue: 4, cells: graph.row('R4C1') },
  { clue: 9, cells: graph.row('R4C1') },
  { clue: 4, cells: graph.row('R7C1') },
  { clue: 6, cells: graph.row('R7C1') },
  { clue: 1, cells: graph.row('R1C1').toReversed() },
  { clue: 2, cells: graph.row('R1C1').toReversed() },
  { clue: 5, cells: graph.row('R2C1').toReversed() },
  { clue: 7, cells: graph.row('R2C1').toReversed() },
  { clue: 2, cells: graph.row('R3C1').toReversed() },
  { clue: 8, cells: graph.row('R3C1').toReversed() },
  { clue: 5, cells: graph.row('R4C1').toReversed() },
  { clue: 6, cells: graph.row('R4C1').toReversed() },
  { clue: 3, cells: graph.row('R7C1').toReversed() },
  { clue: 9, cells: graph.row('R7C1').toReversed() },
  { clue: 8, cells: graph.row('R8C1').toReversed() },

  // Top and bottom clues.
  { clue: 3, cells: graph.column('R1C1') },
  { clue: 6, cells: graph.column('R1C3') },
  { clue: 4, cells: graph.column('R1C4') },
  { clue: 7, cells: graph.column('R1C4') },
  { clue: 6, cells: graph.column('R1C6') },
  { clue: 9, cells: graph.column('R1C6') },
  { clue: 1, cells: graph.column('R1C8') },
  { clue: 4, cells: graph.column('R1C8') },
  { clue: 4, cells: graph.column('R1C9') },
  { clue: 6, cells: graph.column('R1C6').toReversed() },
  { clue: 5, cells: graph.column('R1C7').toReversed() },
  { clue: 8, cells: graph.column('R1C9').toReversed() },
];

const firstSeenClues = clueDefs.map(({ clue, cells }, index) => {
  const scan = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(machines.get(clue), `FSOE-${index + 1}-${clue}`, ...scan);
});

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R1C1', 9),
  new Given('R1C4', 8),
  new Given('R1C7', 7),
  new Given('R4C1', 6),
  new Given('R4C4', 5),
  new Given('R4C7', 4),
  new Given('R7C1', 3),
  new Given('R7C4', 2),
  new Given('R7C7', 1),
  // The two colour names are interchangeable; choose a canonical label to
  // remove that auxiliary-only symmetry without fixing any visible shading.
  new Given(firstShade, SHADE_A),
  ...firstSeenClues,
];
