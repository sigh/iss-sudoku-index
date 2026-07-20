// Title: Losing Your Marbles
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=CfDFD-RzWgg
// Source: https://sudokupad.app/nw96zee4xk

// The source's 7x7 canvas is a frame around this 5x5 puzzle.
const N = 5;
const graph = cellGraph('5x5');
const chaos = graph.makeOverlay('CC');

// Each pair is joined by one of the four drawn marbles.
const MARBLES = [
  ['R1C5', 'R2C5'], // yellow
  ['R2C3', 'R2C4'], // red
  ['R3C3', 'R4C3'], // blue
  ['R4C1', 'R4C2'], // green
];

// Enumerate all runs made from downward-d, then horizontal-d movements.
// Every run descends four rows, so it has eight steps and nine cells.
const enumerateMarbleRuns = () => {
  const runs = [];

  const extend = (path, row, col) => {
    if (row === N) {
      if (col === 1 || col === N) runs.push(path);
      return;
    }

    for (let distance = 1; distance <= N - row; distance++) {
      const vertical = Array.from(
        { length: distance },
        (_, i) => makeCellId(row + i + 1, col),
      );

      for (const direction of [-1, 1]) {
        const nextCol = col + direction * distance;
        if (nextCol < 1 || nextCol > N) continue;

        const horizontal = Array.from(
          { length: distance },
          (_, i) => makeCellId(row + distance, col + direction * (i + 1)),
        );
        extend([...path, ...vertical, ...horizontal], row + distance, nextCol);
      }
    }
  };

  for (let col = 1; col <= N; col++) extend([makeCellId(1, col)], 1, col);
  return runs;
};

const runs = enumerateMarbleRuns(); // 42 geometric possibilities

// A branch selects one run, requires adjacent run cells to cross region
// boundaries, fixes its bottom-corner endpoint to 3, and applies the Zippy rule.
const marbleRun = new Or(runs.map(path => new And([
  ...path.slice(1).map((current, i) =>
    new AllDifferent(...chaos.at([path[i], current]))),
  new Given(path[path.length - 1], 3),
  new Zipper(...path),
])));

return [
  new Shape('5x5'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...MARBLES.map(pair => new SameValues(2, ...chaos.at(pair))),
  // Since each pair is already equal, one representative per marble is enough.
  new AllDifferent(...chaos.at(MARBLES.map(([first]) => first))),
  marbleRun,
];
