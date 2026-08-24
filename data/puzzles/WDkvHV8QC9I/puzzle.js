// Title: Dove of Peace
// Author: Tom Fry
// Video: https://www.youtube.com/watch?v=WDkvHV8QC9I
// Source: https://app.crackingthecryptic.com/sudoku/9jtrRB7LQQ

// Normal sudoku rules apply. Digits never decrease along a thermometer from
// its bulb to any end; they may increase or stay the same ("slow"
// thermometer semantics, not ISS's own strictly-increasing Thermo), so each
// arm is a chain of `a <= b` Pair constraints rather than `new Thermo(...)`.
//
// A drawn stroke's bulb is the point carrying a small circle overlay; the
// rest of that stroke forms one or more arms running away from it, and a
// stroke may fork into further arms partway along. Five drawn strokes carry
// such a circle. Two more drawn strokes carry no circle at either end, and
// each touches one of the five circled strokes at exactly one shared cell
// (no shared edge, so each is its own payload entry, not a duplicate
// recording of the same edge): they are read as further forks of that
// touched stroke's own arm, continuing away from its already-fixed bulb,
// rather than as separately-bulbed thermometers of their own. Grounds: this
// puzzle's setter marks a bulb circle on every stroke needing a direction
// fixed, and these two are the only strokes without one; the rules text's
// "green lines are part of thermometers" reads as green segments belonging
// to the (blue) thermometers already described, not as their own
// separately-bulbed type; and each touch point is a single cell shared by
// two or three drawn entries, a deliberate junction rather than an
// incidental crossing. A third stroke runs off the grid on both sides,
// touching only R4C9 inside the grid; the rules state that lines going off
// the grid are decoration, so it is omitted entirely.

const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

// One arm: a list of cells from the bulb outward.
const arm = (...cells) => new Pair(slowThermoKey, 'slow thermometer', ...cells);

const thermos = [
  // Bulb R4C8 (circle overlay). Its own drawn stroke forks here into a
  // short backward arm and a long forward arm. The forward arm forks again,
  // at R4C9, into the (otherwise unbulbed) green stroke's two cells.
  arm('R4C8', 'R4C7', 'R3C6'),
  arm('R4C8', 'R4C9', 'R5C8', 'R5C7', 'R6C7', 'R7C7', 'R8C6', 'R9C5', 'R9C4'),
  arm('R4C8', 'R4C9', 'R3C9'),
  arm('R4C8', 'R4C9', 'R5C9'),

  // Bulb R1C6 (circle overlay, drawn tip-first): one arm.
  arm('R1C6', 'R2C7', 'R3C7'),

  // Bulb R1C3 (circle overlay, drawn tip-first): one arm.
  arm('R1C3', 'R1C4', 'R1C5'),

  // Bulb R6C1 (circle overlay). Its own drawn stroke forks here into a
  // short arm and a long arm; a second payload entry re-records the long
  // arm's own last edge (R4C4-R4C5) and continues past it, so it is the
  // same physical stroke split across two payload entries, forking again
  // at R4C4 into a third arm.
  arm('R6C1', 'R6C2', 'R5C3'),
  arm('R6C1', 'R5C2', 'R4C1', 'R4C2', 'R3C1', 'R3C2', 'R4C3', 'R4C4', 'R4C5'),
  arm(
    'R6C1', 'R5C2', 'R4C1', 'R4C2', 'R3C1', 'R3C2', 'R4C3', 'R4C4',
    'R3C3', 'R3C4', 'R2C3', 'R2C4'),

  // Bulb R9C3 (circle overlay, drawn tip-first): its arm's tip at R6C4 is
  // where the (otherwise unbulbed) blue stroke crosses, forking there into
  // that stroke's other two cells.
  arm('R9C3', 'R8C4', 'R8C3', 'R7C4', 'R7C3', 'R6C4', 'R6C3', 'R7C2'),
  arm('R9C3', 'R8C4', 'R8C3', 'R7C4', 'R7C3', 'R6C4', 'R6C5'),
];

return [
  new Shape('9x9'),
  ...thermos,
];
