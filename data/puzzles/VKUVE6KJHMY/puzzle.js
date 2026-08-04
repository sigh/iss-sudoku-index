// Title: Farfalle
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=VKUVE6KJHMY
// Source: https://app.crackingthecryptic.com/sudoku/Gg8MND3M98

// Normal sudoku rules apply. Identical digits cannot be a knight's move apart
// (AntiKnight). Digits along thermometers increase from the bulb (Thermo).
// Digits along arrows sum to the number in the attached circle (Arrow, first
// cell is the circle).
//
// The drawn geometry has two circle cells (R3C5, R4C5) each feeding two
// diagonal 3-cell arrows -- the "bowtie/butterfly" the title and video name
// draw. One arrow (from circle R4C5, up-left) is drawn thin and grey with a
// small arrowhead glyph rather than through the payload's `arrows` entries,
// but it carries the same colour/thickness/arrowhead-glyph markers as the
// three payload arrows, so it is encoded the same way. Its three shaft cells
// (R3C4, R2C3, R3C2) are the same three cells as the R3C2-bulb thermometer,
// read off the payload's `wayPoints`: the two clues share a stroke.

return [
  new Shape('9x9'),
  new AntiKnight(),

  new Thermo('R9C8', 'R8C8', 'R7C8'), // bulb R9C8 (green underlay circle)
  new Thermo('R3C2', 'R2C3', 'R3C4'), // bulb R3C2 (green underlay circle)

  new Arrow('R4C5', 'R3C6', 'R2C7', 'R3C8'),
  new Arrow('R4C5', 'R3C4', 'R2C3', 'R3C2'), // hand-drawn grey arrow, shares cells with the R3C2 thermometer
  new Arrow('R3C5', 'R4C4', 'R5C3', 'R4C2'),
  new Arrow('R3C5', 'R4C6', 'R5C7', 'R4C8'),
];
