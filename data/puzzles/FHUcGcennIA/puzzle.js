// Title: Creatures in the Dynamic Fog
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=FHUcGcennIA
// Source: https://sudokupad.app/ey3tqoay3j

// Normal Sudoku. Each marked Wisp is its row, column, or box number, and
// all nine Wisp digits differ. The four monster colours define the local
// parity, sum, knight-move, and all-higher-or-all-lower rules below.

const graph = cellGraph();

const wisps = [
  ['R1C6', [1, 2, 6]],
  ['R2C1', [1, 2]],
  ['R3C9', [3, 9]],
  ['R4C3', [3, 4]],
  ['R5C5', [5]],
  ['R6C7', [6, 7]],
  ['R7C8', [7, 8, 9]],
  ['R8C4', [4, 8]],
  ['R9C2', [2, 7, 9]],
];
const wispCandidates = wisps.map(
  ([cell, candidates]) => new Given(cell, ...candidates));
const distinctWisps = new AllDifferent(...wisps.map(([cell]) => cell));

const sameParityKey = Pair.fnToKey(
  (a, b) => (a % 2) === (b % 2), 9);
const zombies = ['R5C8', 'R6C3'];
const zombieParity = zombies.flatMap(zombie =>
  graph.neighbours(zombie).map(neighbour =>
    new Pair(sameParityKey, 'same parity', zombie, neighbour)));

const vampires = ['R3C7', 'R4C6', 'R6C9', 'R7C1'];
const vampireSums = vampires.map(vampire =>
  new EqualSum(graph.neighbours(vampire), [vampire]));

const knightOffsets = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
const horsemen = ['R2C2', 'R5C3', 'R5C7', 'R8C5'];
const horsemanReach = horsemen.flatMap(horseman =>
  knightOffsets
    .map(([dRow, dCol]) => graph.step(horseman, dRow, dCol))
    .filter(cell => cell !== null)
    .map(cell => new AllDifferent(horseman, cell)));

const poltergeists = ['R2C3', 'R2C5', 'R7C3'];
const poltergeistOrder = poltergeists.map(poltergeist => {
  const neighbours = graph.neighbours(poltergeist);
  const allHigher = neighbours.map(
    neighbour => new GreaterThan(neighbour, poltergeist));
  const allLower = neighbours.map(
    neighbour => new GreaterThan(poltergeist, neighbour));
  return new Or([new And(allHigher), new And(allLower)]);
});

return [
  new Shape('9x9'),
  new Given('R2C2', 1),
  new Given('R2C5', 4),
  ...wispCandidates,
  distinctWisps,
  ...zombieParity,
  ...vampireSums,
  ...horsemanReach,
  ...poltergeistOrder,
];
