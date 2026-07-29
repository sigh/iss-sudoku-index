// Title: Star-Crossed Sandwiches
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=6yzzNCrENAc
// Source: https://app.crackingthecryptic.com/1r4pxkzv1x

// Rules encoded: 0-9 irregular Sudoku (without default rectangular boxes); the two givens; equal digits may not
// be a knight's move apart; no orthogonally or diagonally adjacent pair may
// consist of 0 and/or 9; and every numbered outside clue is either an X-Sum or
// the sum between 0 and 9. The top-C6 ? has no fixed value and is omitted.

const shape = new Shape('10x10', '0-9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// The ten irregular regions transcribed from the drawn region boundaries.
const regions = [
  ['R1C1','R1C2','R1C3','R1C4','R2C1','R2C4','R3C1','R4C1','R5C1','R5C2'],
  ['R1C5','R2C3','R2C5','R2C6','R2C7','R3C3','R3C4','R3C5','R3C7','R4C7'],
  ['R1C6','R1C7','R1C8','R1C9','R1Ca','R2C8','R2Ca','R3C8','R3Ca','R4Ca'],
  ['R2C2','R3C2','R3C6','R4C2','R4C3','R4C4','R4C5','R4C6','R5C3','R5C4'],
  ['R2C9','R3C9','R4C8','R4C9','R5C6','R5C7','R5C8','R5C9','R5Ca','R6C6'],
  ['R5C5','R6C1','R6C2','R6C3','R6C4','R6C5','R7C2','R7C3','R8C2','R9C2'],
  ['R6C7','R6C8','R7C5','R7C6','R7C7','R7C8','R7C9','R8C5','R8C9','R9C9'],
  ['R6C9','R6Ca','R7Ca','R8Ca','R9C7','R9Ca','RaC7','RaC8','RaC9','RaCa'],
  ['R7C1','R8C1','R8C3','R9C1','R9C3','RaC1','RaC2','RaC3','RaC4','RaC5'],
  ['R7C4','R8C4','R8C6','R8C7','R8C8','R9C4','R9C5','R9C6','R9C8','RaC6'],
];

// This Pair key forbids exactly the stated 0/9 adjacencies.
const noStarTouch = Pair.fnToKey((a, b) => !([0, 9].includes(a) && [0, 9].includes(b)), shape);
const canonicalLabels = Pair.fnToKey((a, b) => a < b, shape);
const kingPairs = [
  graph.makeReplicate(new Pair(noStarTouch, '0/9 cannot touch', 'R1C1', 'R1C2'), graph.block('R1C1', 10, 9)),
  graph.makeReplicate(new Pair(noStarTouch, '0/9 cannot touch', 'R1C2', 'R2C1'), graph.block('R1C1', 9, 9)),
  graph.makeReplicate(new Pair(noStarTouch, '0/9 cannot touch', 'R1C1', 'R2C1'), graph.block('R1C1', 9, 10)),
  graph.makeReplicate(new Pair(noStarTouch, '0/9 cannot touch', 'R1C1', 'R2C2'), graph.block('R1C1', 9, 9)),
];

// This state machine scans one line and accepts precisely when the digits
// strictly between 0 and 9 add to the displayed clue; either endpoint may occur first.
const sandwichNFA = clue => NFA.encodeSpec({
  startState: { phase: 'before', sum: 0 },
  transition: ({ phase, sum }, value) => {
    if (phase === 'before') return value === 0 || value === 9
      ? { phase: 'inside', sum: 0 } : { phase, sum };
    if (phase === 'inside') {
      if (value === 0 || value === 9) return sum === clue ? { phase: 'after', sum } : undefined;
      return sum + value <= clue ? { phase, sum: sum + value } : undefined;
    }
    return value === 0 || value === 9 ? undefined : { phase, sum };
  },
  accept: ({ phase }) => phase === 'after',
}, shape);

// Each number is a drawn outside clue; its direction is determined by its side.
const starCrossedClues = [
  [22, graph.column(3)],
  [6, graph.row(6)],
  [4, graph.row(6).slice().reverse()],
  [12, graph.column(2).slice().reverse()],
  [17, graph.column(8).slice().reverse()],
].map(([clue, cells]) => new Or([
  XSum.fromCells(clue, cells, geometry),
  new NFA(sandwichNFA(clue), '0/9 sandwich', cells),
]));

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw(shape.shapeSpec, ...cells)),
  new Given('R4C6', 1),
  new Given('R7C5', 4),
  new AntiKnight(),
  ...kingPairs,
  // The rules leave the labels 5 and 6 exchangeable; use this positional order
  // only to choose one representative of that unnamed label symmetry.
  new Pair(canonicalLabels, 'canonical 5/6 labels', 'R1C3', 'R1C6'),
  ...starCrossedClues,
];
