// Title: Angel Baby
// Author: Svanemamma
// Video: https://www.youtube.com/watch?v=RT4Jc0HtGcY
// Source: https://app.crackingthecryptic.com/sudoku/fjhJTgjhJ6

// Normal sudoku rules apply (default rows/columns/boxes). Digits along
// thermometers increase from the bulb (Thermo). White dots join cells with
// consecutive digits (WhiteDot); "not all dots are given" means undrawn
// adjacent pairs are unconstrained, so WhiteDot is applied only at the three
// drawn dot locations, not exhaustively.
//
// Four heart-shaped thermometers are drawn in grey, thickness-10 rounded
// strokes. Two of them (hearts 1 and 2) arrive in the payload as two line
// entries that share their first and last cell -- a branch point and a
// rejoin point. Per the decode convention, a stroke meeting an interior
// cell of another stroke is one branching figure, not two separate lines.
// Each branching heart is encoded as two Thermo chains that share their
// endpoints: the full main arm (bulb to final tip) and the short second
// arm between the shared branch/rejoin cells -- both increase from the
// bulb side, since the thermometer rule applies along each drawn arm.
// Hearts 3 and 4 are drawn as a single continuous stroke each, so each is
// one Thermo chain.

return [
  new Shape('9x9'),

  new Given('R1C7', 3),
  new Given('R9C3', 3),

  // Heart 1, bulb R4C1.
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C2', 'R2C3', 'R3C3', 'R4C3'),
  new Thermo('R3C1', 'R3C2', 'R3C3'),

  // Heart 2, bulb R5C6.
  new Thermo('R5C6', 'R4C6', 'R3C6', 'R2C6', 'R2C7', 'R3C8', 'R4C7', 'R5C8'),
  new Thermo('R4C6', 'R4C7'),

  // Heart 3, bulb R8C2.
  new Thermo('R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R8C3'),

  // Heart 4, bulb R9C7.
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9'),

  // White dots (consecutive), drawn edge-to-edge between the two named cells.
  new WhiteDot('R1C5', 'R1C6'),
  new WhiteDot('R3C9', 'R4C9'),
  new WhiteDot('R6C4', 'R6C5'),
];
