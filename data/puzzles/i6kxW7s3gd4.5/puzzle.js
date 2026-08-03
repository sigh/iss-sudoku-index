// Title: 5/18/23: Tiers of the Kingdom
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=i6kxW7s3gd4
// Source: https://tinyurl.com/3dtmszpb

// Normal sudoku rules (default row/column/box all-different).
// Kropki dots: white = consecutive, black = 1:2 ratio; not all dots shown.
// Thermometers: strictly increasing from the round bulb.
// Renban line: a set of consecutive digits in any order.
// German Whispers: adjacent digits on the line differ by at least 5.
// Region Sum Line: equal sum within each box it passes through.
// Arrow: shaft digits sum to the circled bulb digit.
// XV pairs: X sums to 10, V sums to 5; not all Xs/Vs are shown.

return [
  new Shape('9x9'),

  // Main diagonal givens.
  new Given('R1C1', 1),
  new Given('R2C1', 2),
  new Given('R3C1', 3),
  new Given('R4C1', 4),
  new Given('R5C1', 5),
  new Given('R6C1', 6),
  new Given('R7C1', 7),
  new Given('R8C1', 8),
  new Given('R9C1', 9),

  // Thermometers (bulb first).
  new Thermo('R3C3', 'R3C4', 'R3C5'),
  new Thermo('R3C9', 'R3C8', 'R3C7'),

  // Renban line.
  new Renban('R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'),

  // German Whispers line (default difference 5).
  new Whisper('R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2'),

  // Region Sum Line.
  new RegionSumLine('R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'),

  // Arrows (bulb cell first, then shaft).
  new Arrow('R7C2', 'R7C3', 'R7C4'),
  new Arrow('R7C6', 'R7C7', 'R7C8'),

  // Black (ratio) dots. Split into two calls, one per contiguous group,
  // because R1C4-R1C5 are grid-adjacent but undotted -- one BlackDot call
  // across all five cells would add that missing edge.
  new BlackDot('R1C3', 'R1C4'),
  new BlackDot('R1C5', 'R1C6', 'R1C7'),

  // White (consecutive) dots. One contiguous chain, every adjacent pair in
  // it is dotted, so a single call is exact.
  new WhiteDot('R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'),

  // XV pairs. Each pair kept separate -- e.g. R8C5/R8C6 are grid-adjacent
  // but not marked, so they must not share one call.
  new V('R9C6', 'R9C7'),
  new V('R9C3', 'R9C4'),
  new X('R8C4', 'R8C5'),
  new X('R8C6', 'R8C7'),
  new X('R8C8', 'R8C9'),
];
