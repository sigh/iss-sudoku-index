// Title: Entanglement
// Author: 3good5you
// Video: https://www.youtube.com/watch?v=RLhzD2wOKak
// Source: https://sudokupad.app/6r6dcn61n3

// Each row and column uses digits from at most two of the three bands 1-3, 4-6, 7-9.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const twoBandMachine = NFA.encodeSpec({
  startState: 0,
  transition: (bands, value) => bands | (1 << Math.floor((value - 1) / 3)),
  accept: bands => bands !== 0b111,
}, shape);
const bandConstraints = [...graph.rows(), ...graph.columns()].map(
  cells => new NFA(twoBandMachine, 'At most two digit bands', ...cells),
);

return [
  shape,
  new RegionSize(9), // Four outlined 3x3 regions on the 6x6 grid.
  ...bandConstraints,
  new Arrow('R1C4', 'R2C3', 'R1C2', 'R2C1'),
  new Arrow('R6C3', 'R6C4', 'R5C5', 'R6C6'),
  new Arrow('R1C5', 'R2C4', 'R3C5'),
  new Arrow('R3C3', 'R4C3', 'R5C3'),
  new Arrow('R3C2', 'R4C1', 'R5C2'),
];
