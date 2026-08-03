// Title: July 3, 2023: Clone Vats
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=KlH18ihoZlI
// Source: https://tinyurl.com/4dbzj7um

// Normal sudoku rules apply. Each Quad's values must all appear among its
// surrounding four cells, with multiplicity: Quad's RequiredValues handler is
// non-strict but counts each listed value's occurrences, so a value repeated
// in the circle (e.g. R3C3's 1,1,2,2) is required to occur that many times in
// the four cells, matching the ruleset's repeat clause.
return [
  new Shape('9x9'),
  new Quad('R1C2', 2, 3, 6, 9),
  new Quad('R2C8', 1, 3, 5, 6),
  new Quad('R3C3', 1, 1, 2, 2),
  new Quad('R3C6', 3, 3, 4, 4),
  new Quad('R6C3', 5, 5, 6, 6),
  new Quad('R6C6', 7, 7, 8, 8),
  new Quad('R7C1', 1, 6, 8, 9),
  new Quad('R8C7', 3, 5, 6, 7),
];
