// Title: Call My Bluff
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=nWkwlOANDPk
// Source: https://app.crackingthecryptic.com/sudoku/F2nGdPj2GH

// Normal sudoku rules apply. All clue types are standard, but exactly one
// instance of every clue type is lying. Non-lying clues work as follows:
//   Between Lines: cells along a line between two blue circles have values
//     strictly between the two circle values.
//   Black Kropki: cells separated by a black dot are in ratio 1:2.
//   Even: a cell with a grey square is even.
//   German Whispers: adjacent digits along a green line differ by >= 5.
//   Odd: a cell with a grey circle is odd.
//   Renban: cells along a purple line are a set of consecutive digits.
//   Sandwich: a clue outside the grid is the sum of the digits between the
//     1 and the 9 in that row/column.
//   V: cells separated by a V sum to 5.
//   White Kropki: cells separated by a white dot are consecutive.
//   X: cells separated by an X sum to 10.
// The drawing carries exactly three instances of each of the ten types, so each
// group below is a three-way choice of which single instance is false.
// Every clause of the rules text is encoded; nothing is omitted.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Pairwise predicates. Pair(key, name, x, y) applies key(x, y) in list order.
const atMost = Pair.fnToKey((a, b) => a <= b, 9);
const atLeast = Pair.fnToKey((a, b) => a >= b, 9);
const notWhisper5 = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, 9);
const notSum5 = Pair.fnToKey((a, b) => a + b !== 5, 9);
const notSum10 = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notRatio2 = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);

// Renban negation. State is a bitmask of the values seen so far; a three-cell
// renban holds iff the mask has three bits spanning exactly two, so the accept
// state is the complement of that.
const notRenbanSpec = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << (value - 1)),
  accept: (mask) => {
    let count = 0, min = 10, max = 0;
    for (let v = 1; v <= 9; v++) {
      if (!(mask & (1 << (v - 1)))) continue;
      count++;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return !(count === 3 && max - min === 2);
  },
}, 9);

// Sandwich negation, scanning a whole row or column. phase 0 is before the
// first of {1, 9}, phase 1 is the crust between them, phase 2 is after the
// second; the running total is clamped one above the clue so the state count
// stays bounded. Every 9x9 line contains both a 1 and a 9, so phase 2 is
// always reached and the accept state is simply "total differs from the clue".
const notSandwichSpec = total => NFA.encodeSpec({
  startState: { phase: 0, sum: 0 },
  transition: ({ phase, sum }, value) => {
    if (phase === 0) return (value === 1 || value === 9) ? { phase: 1, sum: 0 } : { phase, sum };
    if (phase === 1) {
      return (value === 1 || value === 9)
        ? { phase: 2, sum }
        : { phase, sum: Math.min(total + 1, sum + value) };
    }
    return { phase, sum };
  },
  accept: ({ phase, sum }) => phase === 2 && sum !== total,
}, 9);

// "Exactly one instance of every clue type is lying": for each group, pick the
// liar and assert its negation while the other two instances hold.
const oneLie = clues => new Or(clues.map((_, i) => new And(
  clues.map((clue, j) => (i === j ? clue.negation : clue.rule)))));

// Grey between-lines; the first and last cell of each list is the blue circle
// the drawn stroke terminates inside. The third line steps diagonally from
// R7C6 to its R6C7 circle, as drawn.
const betweenLines = [
  ['R4C7', 'R3C7', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9'],
  ['R4C2', 'R3C3', 'R2C3', 'R2C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R6C4', 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R7C6', 'R6C7'],
];
// A between line is false when some line cell is not strictly between the
// circles, i.e. it is >= both of them or <= both of them.
const betweenClue = cells => ({
  rule: new Between(...cells),
  negation: new Or(cells.slice(1, -1).flatMap(cell => [
    new And([new Pair(atMost, '', cells[0], cell), new Pair(atMost, '', cells.at(-1), cell)]),
    new And([new Pair(atLeast, '', cells[0], cell), new Pair(atLeast, '', cells.at(-1), cell)]),
  ])),
});

// Green German-whisper lines.
const whisperLines = [
  ['R9C1', 'R9C2', 'R9C3'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R4C4', 'R4C5', 'R4C6'],
];
const whisperClue = cells => ({
  rule: new Whisper(5, ...cells),
  negation: new Or(cells.slice(0, -1).map((cell, i) => new Pair(notWhisper5, '', cell, cells[i + 1]))),
});

// Purple renban lines.
const renbanLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R1C5', 'R2C5', 'R3C5'],
];
const renbanClue = cells => ({
  rule: new Renban(...cells),
  negation: new NFA(notRenbanSpec, 'not renban', ...cells),
});

// Sandwich clues: 10 above column 2, 19 left of row 2, 16 above column 8.
const sandwichClues = [
  [10, ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2']],
  [19, ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  [16, ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
];
const sandwichClue = ([total, cells]) => ({
  rule: Sandwich.fromCells(total, cells, geometry),
  negation: new NFA(notSandwichSpec(total), 'not sandwich', ...cells),
});

// Drawn V, X, white-dot and black-dot dominoes, and the grey parity cells.
const vPairs = [['R6C1', 'R6C2'], ['R6C8', 'R6C9'], ['R5C5', 'R6C5']];
const xPairs = [['R2C2', 'R3C2'], ['R2C8', 'R3C8'], ['R8C5', 'R9C5']];
const whiteDots = [['R6C2', 'R7C2'], ['R6C9', 'R7C9'], ['R3C9', 'R4C9']];
const blackDots = [['R7C5', 'R8C5'], ['R4C6', 'R5C6'], ['R4C4', 'R5C4']];
const greyCircles = ['R1C4', 'R1C6', 'R4C8'];
const greySquares = ['R6C3', 'R6C6', 'R4C3'];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

return [
  new Shape('9x9'),
  oneLie(betweenLines.map(betweenClue)),
  oneLie(whisperLines.map(whisperClue)),
  oneLie(renbanLines.map(renbanClue)),
  oneLie(sandwichClues.map(sandwichClue)),
  oneLie(vPairs.map(cells => ({
    rule: new V(...cells),
    negation: new Pair(notSum5, '', ...cells),
  }))),
  oneLie(xPairs.map(cells => ({
    rule: new X(...cells),
    negation: new Pair(notSum10, '', ...cells),
  }))),
  oneLie(whiteDots.map(cells => ({
    rule: new WhiteDot(...cells),
    negation: new Pair(notConsecutive, '', ...cells),
  }))),
  oneLie(blackDots.map(cells => ({
    rule: new BlackDot(...cells),
    negation: new Pair(notRatio2, '', ...cells),
  }))),
  oneLie(greyCircles.map(cell => ({
    rule: new Given(cell, ...ODD),
    negation: new Given(cell, ...EVEN),
  }))),
  oneLie(greySquares.map(cell => ({
    rule: new Given(cell, ...EVEN),
    negation: new Given(cell, ...ODD),
  }))),
];
