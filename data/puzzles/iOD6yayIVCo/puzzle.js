// Title: Calm Construction
// Author: oskode
// Video: https://www.youtube.com/watch?v=iOD6yayIVCo
// Source: https://sudokupad.app/4jw7hz9rd1

// Standard Sudoku boxes remain active. ChaosConstruction adds nine further
// orthogonally connected 1-9 regions. Each ChaosCount compares the circle's
// chaos-region label with all nine labels in its marked 3x3 box.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const circles = [
  'R1C1', 'R1C2', 'R1C7', 'R1C8', 'R1C9',
  'R2C2', 'R2C4', 'R2C5', 'R2C6',
  'R4C2', 'R4C5', 'R4C6', 'R4C9',
  'R5C2', 'R8C1', 'R9C9',
];

const markedBoxLabels = (circle) => {
  const { row, col } = parseCellId(circle);
  const boxNumber = 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
  const circleLabel = cc.at(circle);
  return [circleLabel, ...cc.at(graph.box(boxNumber)).filter(label => label !== circleLabel)];
};

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new Given('R6C5', 9),
  ...circles.map(cell => new ChaosCount(cell, 0, ...markedBoxLabels(cell))),
];
