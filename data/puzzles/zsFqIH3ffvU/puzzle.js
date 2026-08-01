// Title: Fallen Angels
// Author: Abdul the Killer
// Video: https://www.youtube.com/watch?v=zsFqIH3ffvU
// Source: https://app.crackingthecryptic.com/fb9h9r647M

// Standard Sudoku and anti-knight apply. A grey cell has a within-box king-neighbour
// one lower, and every non-grey cell has no such neighbour. Equal letters are equal;
// distinct letters are different.
const shadedCells = [
  'R1C1', 'R1C5', 'R1C6', 'R1C7', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C6',
  'R2C7', 'R2C8', 'R2C9', 'R3C2', 'R3C4', 'R3C5', 'R3C9', 'R4C2', 'R4C4',
  'R4C5', 'R4C7', 'R4C9', 'R5C1', 'R5C2', 'R5C3', 'R5C5', 'R5C8', 'R5C9',
  'R6C2', 'R6C5', 'R6C9', 'R7C1', 'R7C5', 'R7C8', 'R8C1', 'R8C2', 'R8C5',
  'R8C7', 'R8C8', 'R8C9', 'R9C1', 'R9C2', 'R9C3', 'R9C5', 'R9C6', 'R9C7',
]; // The 45 light-grey one-cell underlays.

const letters = {
  F: ['R1C4'], A: ['R2C5', 'R4C1'], L: ['R3C6', 'R4C7', 'R8C5'],
  E: ['R5C8', 'R7C4'], N: ['R6C9', 'R5C2'], G: ['R6C3'], S: ['R9C6'],
}; // The white text overlays spelling FALLEN ANGELS.

const shaded = new Set(shadedCells);
const graph = cellGraph('9x9');
const withinBoxNeighbours = cell => {
  const box = new Set(graph.boxes().find(cells => cells.includes(cell)));
  return graph.kingNeighbours(cell).filter(neighbour => box.has(neighbour));
};
const higherThanNeighbour = Pair.fnToKey((a, b) => a === b + 1, 9);
const notHigherThanNeighbour = Pair.fnToKey((a, b) => a !== b + 1, 9);
const shadeConstraints = graph.cells().flatMap((cell) => {
  const neighbours = withinBoxNeighbours(cell);
  return shaded.has(cell)
    ? [new Or(neighbours.map(neighbour => new Pair(
      higherThanNeighbour, 'one greater than a within-box neighbour', cell, neighbour)))]
    : neighbours.map(neighbour => new Pair(
      notHigherThanNeighbour, 'not one greater than a within-box neighbour', cell, neighbour));
});
// The direction of each Pair is the potentially shaded cell followed by its neighbour.

const sameLetterConstraints = Object.values(letters)
  .filter(group => group.length > 1)
  .map(group => new SameValues(group.length, ...group));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...sameLetterConstraints,
  new AllDifferent(...Object.values(letters).map(group => group[0])),
  ...shadeConstraints,
];
