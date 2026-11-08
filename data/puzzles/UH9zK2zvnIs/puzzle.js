// Title: Chaos Construction: Cyclic Consecutive
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=UH9zK2zvnIs
// Source: https://sudokupad.app/dmj8j1evq1

// Latin rows/columns, six connected six-cell regions, printed boundaries,
// purple renbans, and directed cyclic succession across every region boundary.
const shape = new Shape('6x6');
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');

// The three purple strokes; the closed loop contains four distinct cells.
const lines = [
  ['R5C2', 'R6C1'],
  ['R3C2', 'R4C1'],
  ['R2C5', 'R3C5', 'R3C6', 'R2C6'],
];
const renbans = lines.map(cells => new Renban(...cells));

// The five internal black boundary segments.
const boundaries = [
  ['R2C3', 'R2C4'], ['R2C1', 'R3C1'], ['R6C4', 'R6C5'],
  ['R5C3', 'R6C3'], ['R4C3', 'R4C4'],
];
const borders = boundaries.map(cells => new AllDifferent(...cc.at(cells)));

// Either labels agree or the later (right/bottom) digit is the cyclic successor.
const successor = Pair.fnToKey((a, b) => b === a % 6 + 1, shape);
const succession = graph.cells().flatMap(a =>
  [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
    const b = graph.step(a, dr, dc);
    return b ? [new Or([
      new SameValues(2, ...cc.at([a, b])),
      new Pair(successor, 'CyclicSuccessor', a, b),
    ])] : [];
  })
);
return [shape, new NoBoxes(), new ChaosConstruction(), ...renbans, ...borders, ...succession];
