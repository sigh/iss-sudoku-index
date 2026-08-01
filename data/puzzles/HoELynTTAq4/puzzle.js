// Title: City of Skyscrapers
// Author: Kitty Trouble
// Video: https://www.youtube.com/watch?v=HoELynTTAq4
// Source: https://app.crackingthecryptic.com/DdfLMG9fGf

// Normal Sudoku uses digits 1-9. Cage digits are distinct; each cage's sum is
// its skyscraper height. Outside clues count strictly increasing cage heights
// in the indicated row or column direction. Uncaged cells have no building.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Cage cells transcribed from the drawn no-total killer cages, in payload order.
const cages = [
  ['R9C1'], ['R9C2'], ['R9C3'], ['R1C2'], ['R1C3', 'R1C4'],
  ['R1C5', 'R2C4', 'R2C5'], ['R1C7', 'R1C8', 'R2C8'],
  ['R3C8', 'R4C7', 'R4C8'], ['R4C1', 'R4C2'], ['R6C4', 'R6C5'],
  ['R6C6', 'R7C6'], ['R5C6', 'R5C7'], ['R8C8', 'R8C9', 'R9C9'],
  ['R6C8', 'R7C8'], ['R7C1', 'R7C2', 'R8C2'],
  ['R7C5', 'R8C5', 'R8C6'], ['R9C4', 'R9C5', 'R9C6'],
  ['R4C4', 'R5C4'], ['R3C4', 'R3C5'], ['R2C1', 'R2C2'],
  ['R5C9', 'R6C9'], ['R1C1'], ['R1C2'],
];

// Two base-16 Var digits encode each 0-24 cage sum: height = 16*high + low.
const high = new Var('H', 'cage height high digit', cages.length);
const low = new Var('L', 'cage height low digit', cages.length);
const heightParts = cages.flatMap((cells, i) => [
  new Given(high.cell(i + 1), 0, 1),
  new Sum(0, ...cells, [high.cell(i + 1), -16], [low.cell(i + 1), -1]),
]);

// The NFA reads high/low pairs and counts a building only when its full height
// exceeds the preceding maximum; equal heights are not newly visible.
const skyline = clue => NFA.encodeSpec({
  startState: { high: null, maximum: -1, visible: 0 },
  transition: (state, value) => {
    if (state.high === null)
      return value <= 1 ? { ...state, high: value } : undefined;
    const height = 16 * state.high + value;
    const visible = state.visible + (height > state.maximum ? 1 : 0);
    if (visible > clue) return undefined;
    return { high: null, maximum: Math.max(state.maximum, height), visible };
  },
  accept: state => state.high === null && state.visible === clue,
  maxDepth: 12,
}, shape);

const heights = ids => ids.flatMap(id => [high.cell(id), low.cell(id)]);
const clues = [
  [3, [22, 4, 23, 5, 6, 7]],       // left R1
  [3, [20, 6, 7]],                  // left R2
  [3, [9, 18, 8]],                  // left R4
  [3, [18, 12, 21]],                // left R5
  [4, [1, 2, 3, 17, 13]],           // left R9
  [2, [14, 11, 16, 15]],            // right R7
  [3, [13, 16, 15]],                // right R8
  [2, [5, 3]],                      // top C3
  [3, [5, 6, 19, 18, 10, 17]],      // top C4
  [3, [7, 8, 14, 13]],              // top C8
  [2, [21, 13]],                    // top C9
  [3, [1, 15, 9, 20, 22]],          // bottom C1
  [3, [17, 10, 18, 19, 6, 5]],      // bottom C4
  [1, [17, 16, 11]],                // bottom C6
];

return [
  shape,
  graph.makeReplicate(new Given('R1C1', ...digits)),
  high,
  low,
  ...cages.filter(cells => cells.length > 1).map(cells => new AllDifferent(...cells)),
  ...heightParts,
  ...clues.map(([clue, ids]) => new NFA(skyline(clue), `visible ${clue}`, heights(ids))),
];
