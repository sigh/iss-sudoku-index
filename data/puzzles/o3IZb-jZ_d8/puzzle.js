// Title: Stepping Stones
// Author: grkles
// Video: https://www.youtube.com/watch?v=o3IZb-jZ_d8
// Source: https://sudokupad.app/cj8grmrtes

// Divide the grid into nine orthogonally connected 9-cell regions, each with
// digits 1-9 once; rows and columns also hold 1-9 once. The border drawn
// between R8C8 and R8C9 separates two regions.
//
// Each outside clue reads towards the grid. It sums the first digit in each
// successive same-region segment, and those selected digits increase strictly.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const CLUES = [
  { target: 3, cells: graph.column(1) },
  { target: 9, cells: graph.column(2) },
  { target: 21, cells: graph.column(5) },
  { target: 30, cells: graph.row(1) },
  { target: 17, cells: graph.row(2) },
  { target: 23, cells: graph.row(4) },
  { target: 7, cells: graph.row(9) },
  { target: 23, cells: graph.row(8).reverse() },
  { target: 11, cells: graph.column(2).reverse() },
  { target: 13, cells: graph.column(9).reverse() },
];

function steppingNFA(target) {
  // The NFA alternates a grid digit with its Chaos Construction region label.
  // It branches over the finite strictly increasing digit sets that sum to the
  // clue, then consumes one set member at each new region label. Keeping the
  // remaining set instead of a running total stays below the NFA state limit.
  const choices = [];
  function collect(remaining, minimum, chosen) {
    if (remaining === 0) {
      choices.push(chosen);
      return;
    }
    for (let digit = minimum; digit <= 9 && digit <= remaining; digit++) {
      collect(remaining - digit, digit + 1, [...chosen, digit]);
    }
  }
  collect(target, 1, []);

  return NFA.encodeSpec({
    startState: { phase: 'digit', region: 0, remaining: [], digit: 0 },
    transition({ phase, region, remaining, digit }, value) {
      if (phase === 'digit') return { phase: 'region', region, remaining, digit: value };
      if (region !== 0 && value === region) {
        return { phase: 'digit', region, remaining, digit: 0 };
      }
      const candidates = region === 0 ? choices : [remaining];
      return candidates
        .filter(sequence => sequence[0] === digit)
        .map(sequence => ({
          phase: 'digit', region: value, remaining: sequence.slice(1), digit: 0,
        }));
    },
    accept: ({ phase, remaining }) => phase === 'digit' && remaining.length === 0,
  }, 9);
}

function interleaveRegionLabels(cells) {
  return cells.flatMap(cell => [cell, cc.at(cell)]);
}

const steppingClues = CLUES.map(({ target, cells }) =>
  new NFA(steppingNFA(target), `Stepping${target}`, ...interleaveRegionLabels(cells)));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R5C5', 3),
  new Given('R5C8', 6),
  new AllDifferent(cc.at('R8C8'), cc.at('R8C9')),
  ...steppingClues,
];
