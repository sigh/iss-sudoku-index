// Title: Excluded Middle
// Author: Hypocaustum
// Video: https://www.youtube.com/watch?v=veA2RDHHE_U
// Source: https://sudokupad.app/0xz9ur1emo

// Standard Sudoku, increasing thermometers and distinct-digit sum cages apply.
// Orthogonal neighbours in the same cage cannot be consecutive; other edges are unrestricted.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
// Drawn cage totals and cell lists.
const cages = [[16, ["R1C1", "R1C2", "R2C1"]], [10, ["R2C2", "R2C3", "R3C2"]], [16, ["R3C3", "R3C4", "R4C3"]], [20, ["R4C4", "R4C5", "R5C4"]], [11, ["R5C6", "R6C5", "R6C6"]], [18, ["R6C7", "R7C6", "R7C7"]], [15, ["R7C8", "R8C7", "R8C8"]], [10, ["R8C9", "R9C8", "R9C9"]], [19, ["R7C2", "R8C1", "R8C2", "R8C3", "R9C2"]], [27, ["R1C8", "R2C7", "R2C8", "R2C9", "R3C8"]]];
// Drawn thermometer paths, bulb first.
const thermometers = [["R1C1", "R2C2", "R3C3", "R4C4", "R5C5"], ["R9C9", "R8C8", "R7C7", "R6C6"], ["R9C1", "R8C2", "R7C3"], ["R1C8", "R2C7", "R3C8", "R2C9"]];
// The predicate forbids consecutive values on each internal cage edge.
const nonconsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape);
const cageEdges = cages.flatMap(([, cells]) => cells.flatMap(a =>
  graph.neighbours(a).filter(b => cells.includes(b) && a < b)
    .map(b => new Pair(nonconsecutive, 'Cage nonconsecutive', a, b))));
return [
  shape,
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...cageEdges,
];
