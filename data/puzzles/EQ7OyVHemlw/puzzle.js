// Title: The Continental
// Author: Blobz
// Video: https://www.youtube.com/watch?v=EQ7OyVHemlw
// Source: https://sudokupad.app/blobz/the-continental

// Normal Sudoku. Each listed cage has distinct digits and, where shown, its
// displayed total. A digit in a cell orthogonally outside a cage cannot occur
// in that cage. Fog and its foglight marker are presentation-only and omitted.
// Cage cells are transcribed from the dashed cages in the source payload.
const numberedCages = [
  [1, ['R6C4']],
  [9, ['R6C3', 'R7C3', 'R7C4']],
  [10, ['R5C5', 'R6C5', 'R7C5']],
  [11, ['R5C3', 'R5C4']],
  [16, ['R7C6', 'R8C4', 'R8C5', 'R8C6']],
  [21, ['R8C7', 'R9C6', 'R9C7']],
];
const unnumberedCages = [
  ['R8C2', 'R8C3', 'R9C3', 'R9C4'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R4C5', 'R4C6', 'R4C7', 'R5C7'],
  ['R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
];
const cageCells = numberedCages.map(([, cells]) => cells).concat(unnumberedCages);

// Derive each cage boundary from its drawn cells; only external orthogonal
// neighbours participate, so cells inside the same cage are not paired here.
const cageBoundarySegments = cageCells.flatMap(cells => {
  const inside = new Set(cells);
  return cells.flatMap(cell => {
    const {row, col} = parseCellId(cell);
    return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
      .map(([r, c]) => makeCellId(r, c))
      .filter(neighbour => !inside.has(neighbour))
      .map(neighbour => [cell, neighbour]);
  });
});

// Each two-cell segment is one cage cell followed by a neighbouring external
// cell. The machine stores the cage digit, rejects an equal neighbour, and
// resets at every segment break.
const cageBoundaryRule = NFA.encodeSpec({
  startState: {cageDigit: null, complete: false},
  transition: ({cageDigit, complete}, value) => {
    if (value === SEGMENT_BREAK) {
      return complete ? {cageDigit: null, complete: false} : undefined;
    }
    if (cageDigit === null) return {cageDigit: value, complete: false};
    return cageDigit === value ? undefined : {cageDigit: null, complete: true};
  },
  accept: ({complete}) => complete,
}, 9, {multiSegment: true});

return [
  new Shape('9x9'),
  ...numberedCages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...unnumberedCages.map(cells => new AllDifferent(...cells)),
  new NFA(cageBoundaryRule, 'cage boundary', ...cageBoundarySegments),
];
