// Title: Entropic Arrows
// Author: Enchanter73
// Video: https://www.youtube.com/watch?v=W3hGY3SuOnI
// Source: https://sudokupad.app/cotvgns3r5

// ISS GlobalEntropy is 9x9-specific, so the 6x6 rule is encoded directly:
// every 2x2 window must contain at least one digit from each entropic band.

const constraints = [
  new Shape('6x6'),

  new Arrow('R3C3', 'R2C3', 'R1C3'),
  new Arrow('R3C4', 'R2C4', 'R1C4'),

  new WhiteDot('R5C1', 'R6C1'),
  new WhiteDot('R6C3', 'R5C3'),
  new WhiteDot('R2C5', 'R1C5'),
];

function hasAnyOf(values) {
  return NFA.encodeSpec({
    startState: false,
    transition: (seen, value) => seen || values.includes(value),
    accept: (seen) => seen,
  }, 6);
}

const entropySets = [
  { name: 'low', machine: hasAnyOf([1, 2]) },
  { name: 'middle', machine: hasAnyOf([3, 4]) },
  { name: 'high', machine: hasAnyOf([5, 6]) },
];

for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 5; col++) {
    const square = [
      makeCellId(row, col),
      makeCellId(row, col + 1),
      makeCellId(row + 1, col),
      makeCellId(row + 1, col + 1),
    ];
    for (const entropySet of entropySets) {
      constraints.push(new NFA(entropySet.machine, entropySet.name, ...square));
    }
  }
}

return constraints;
