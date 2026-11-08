// Title: Dutch Flat Mates: Slow Thermometers (CC)
// Author: Flinty
// Video: https://www.youtube.com/watch?v=wVMu9tKOXe0
// Source: https://sudokupad.app/s63lzmopav

// Deduce nine connected nine-cell regions, with 1-9 once per row, column,
// and region; enforce Dutch flatmates and nondecreasing bulb-to-tip thermometers.
// Orthogonal thermometer steps join cells in the same discovered region.
const shape = new Shape('9x9');
const cc = cellGraph('9x9').makeOverlay('CC');
// Drawn thermometer paths, ordered from each circular bulb to its tip.
const thermometers = [['R6C4', 'R6C5', 'R5C5', 'R5C4', 'R4C4', 'R4C5'], ['R6C3', 'R5C3', 'R4C3'], ['R3C3', 'R2C3', 'R1C3'], ['R3C3', 'R3C4', 'R3C5', 'R2C5', 'R1C4'], ['R7C5', 'R7C4', 'R7C3', 'R8C3', 'R9C4', 'R9C5', 'R8C5'], ['R2C6', 'R1C5'], ['R4C6', 'R5C6'], ['R4C6', 'R4C7', 'R5C7', 'R6C7', 'R6C6'], ['R6C2', 'R6C1', 'R5C2'], ['R6C8', 'R7C9', 'R7C8']];
// The pair relation accepts precisely a nondecreasing step.
const nondecreasing = Pair.fnToKey((a, b) => a <= b, shape);
const slowThermometers = thermometers.map(cells =>
  new Pair(nondecreasing, 'Slow thermometer', ...cells));
const sameRegionSteps = thermometers.flatMap(cells => cells.slice(1).flatMap((b, i) => {
  const a = cells[i];
  const x = parseCellId(a), y = parseCellId(b);
  return Math.abs(x.row - y.row) + Math.abs(x.col - y.col) === 1
    ? [new SameValues(2, ...cc.at([a, b]))] : [];
}));
return [shape, new NoBoxes(), new ChaosConstruction(), new DutchFlatmates(),
  ...slowThermometers, ...sameRegionSteps];
