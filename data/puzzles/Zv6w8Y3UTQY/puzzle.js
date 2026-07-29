// Title: Chaos Construction: Exclusions (8x8)
// Author: KNT
// Video: https://www.youtube.com/watch?v=Zv6w8Y3UTQY
// Source: https://sudokupad.app/3rr7h8xl3w

// Digits 1-8 occur once per row, column, and solver-discovered connected region.
// Omitted: the arrow exclusion-count rule. See the accompanying notes.

return [
  new Shape('8x8'),
  new NoBoxes(),
  new ChaosConstruction(),
];
