// Title: Eye of the Beholder
// Author: Kyle Watt
// Video: https://www.youtube.com/watch?v=0uDsOb5Te20
// Source: https://app.crackingthecryptic.com/sudoku/qJH7jPp2p9

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's `regions`).
// Thermometers increase from the bulb (round end) to the tip: Thermo.
// Each arrow's circle is a single cell coincident with the arrow's own bulb
// cell and carries no printed digit, so the bulb's own value is the sum of
// the rest of the arrow: Arrow(bulb, ...arms).
// The central cell (grid center, R5C5) must be less than each orthogonal
// neighbor -- stated directly in the rules text, encoded as four GreaterThan
// pairs. The payload also draws four tiny arrow marks radiating from R5C5;
// they illustrate this same sentence and carry no separate sum or value.
// Two small ">"-shaped marks in row 4 are read from their raw waypoints: each
// is a 3-point chevron whose vertex sits on the smaller cell's side, per
// "the greater than symbols point to the smaller cell" -- giving
// R4C4 > R4C5 and R4C6 > R4C5.

return [
  new Shape('9x9'),

  // Thermometers: bulb cell first, strictly increasing to the tip.
  new Thermo('R7C6', 'R7C5'),
  new Thermo('R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7'),
  new Thermo('R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C4'),

  // Arrows: circle cell first (its value is the sum), then the arm cells.
  new Arrow('R1C5', 'R2C6', 'R3C6'),
  new Arrow('R3C7', 'R2C8', 'R2C9', 'R1C9'),
  new Arrow('R5C9', 'R6C8', 'R6C7'),
  new Arrow('R7C7', 'R8C8', 'R8C9', 'R9C9'),
  new Arrow('R9C5', 'R8C4', 'R7C4'),
  new Arrow('R7C3', 'R8C2', 'R9C2', 'R9C1'),
  new Arrow('R5C1', 'R4C2', 'R4C3'),
  new Arrow('R3C3', 'R2C2', 'R1C2', 'R1C1'),

  // Central cell less than each orthogonal neighbor.
  new GreaterThan('R4C5', 'R5C5'),
  new GreaterThan('R6C5', 'R5C5'),
  new GreaterThan('R5C4', 'R5C5'),
  new GreaterThan('R5C6', 'R5C5'),

  // Greater-than symbols in row 4, both pointing at R4C5.
  new GreaterThan('R4C4', 'R4C5'),
  new GreaterThan('R4C6', 'R4C5'),
];
