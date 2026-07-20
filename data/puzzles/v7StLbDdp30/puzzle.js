// Title: Blue Arrow
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=v7StLbDdp30
// Source: https://sudokupad.app/qz9m4zn7nf

// Every cell except the three-cell pill lies on the jumping arrow. Its total is
// order-independent, so this part remains exact even though the decoded stroke
// fragments do not preserve the complete traversal needed by the region-sum rule.
const NON_PILL = Array.from({ length: 81 }, (_, i) =>
  makeCellId(Math.floor(i / 9) + 1, (i % 9) + 1)
).slice(3);

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),

  new Sum(0, ...NON_PILL, ['R1C1', -100], ['R1C2', -10], ['R1C3', -1]),

  new GreaterThan('R1C8', 'R1C9'),
  new GreaterThan('R2C7', 'R3C7'),
  new GreaterThan('R9C7', 'R9C8'),
  new GreaterThan('R7C5', 'R6C5'),
  new GreaterThan('R5C5', 'R5C4'),
];
