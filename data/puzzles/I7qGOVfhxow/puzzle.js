// Title: Projected Differences
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=I7qGOVfhxow
// Source: https://sudokupad.app/gfjgpqtw7z

// X Sudoku: rows, columns, boxes, and both marked blue diagonals are all-different.
// At each drawn diamond, its digit N selects cells N orthogonal steps away;
// at least one pair of selected cells differs by N. Unmarked cells have no
// Projected Differences constraint.

const shape = new Shape('9x9');
const graph = cellGraph();

// The diamond coordinates are transcribed from the drawn black-and-white diamond marks.
const diamonds = [
  'R1C1', 'R1C9', 'R2C1', 'R2C4', 'R2C5', 'R2C8', 'R3C1', 'R3C7',
  'R4C6', 'R5C5', 'R6C4', 'R8C2', 'R8C4', 'R8C5', 'R9C1',
];

function projectedSpec(distance) {
  return NFA.encodeSpec({
    startState: { diamond: null, first: null },
    transition: ({ diamond, first }, value) => {
      if (diamond === null) return { diamond: value, first: null };
      if (diamond !== distance) return { diamond, first: null };
      if (first === null) return { diamond, first: value };
      return Math.abs(first - value) === distance
        ? { diamond, first: null }
        : undefined;
    },
    accept: ({ diamond, first }) => diamond !== distance || first === null,
  }, 9);
}

const projectedByDistance = new Map(
  Array.from({ length: 9 }, (_, i) => [i + 1, projectedSpec(i + 1)]));

function cellAt(row, col) {
  return row >= 1 && row <= 9 && col >= 1 && col <= 9 ? makeCellId(row, col) : null;
}

function projectedDifferenceConstraints(diamond) {
  const { row, col } = parseCellId(diamond);
  return Array.from({ length: 9 }, (_, i) => {
    const distance = i + 1;
    const projected = [
      cellAt(row - distance, col), cellAt(row, col + distance),
      cellAt(row + distance, col), cellAt(row, col - distance),
    ].filter(cell => cell !== null);
    const pairs = projected.flatMap((first, firstIndex) =>
      projected.slice(firstIndex + 1).map(second =>
        new NFA(projectedByDistance.get(distance), `projected-${distance}`,
          diamond, first, second)));

    // A digit with fewer than two in-grid projections is impossible at this diamond.
    return pairs.length > 0
      ? new Or(pairs)
      : new NFA(NFA.encodeSpec({
        startState: null,
        transition: (_, value) => value === distance ? undefined : null,
        accept: () => true,
      }, 9), `no-projection-${distance}`, diamond);
  });
}

return [
  shape,
  new Given('R4C3', 6),
  new Diagonal(1),
  new Diagonal(-1),
  ...diamonds.flatMap(projectedDifferenceConstraints),
];
