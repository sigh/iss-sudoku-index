// Title: Ambiguity
// Author: Zetamath
// Video: https://www.youtube.com/watch?v=YRHs1MqWMVs
// Source: https://app.crackingthecryptic.com/sudoku/3Rf6DHNPhb
//
// Normal sudoku rules apply (default row/column/box AllDifferent). Every grey
// line has a bulb (filled circle) at one end and is either a Thermo (values
// strictly increase from the bulb) or an Arrow (the remaining cells sum to the
// bulb) -- the rules text never says which for any given line, so each line is
// encoded as Or(Thermo, Arrow) over its own cells. Which reading applies to
// which line is exactly the puzzle's own logic (title: "Ambiguity"), so it is
// not resolved here.
//
// Line cell order below is bulb-first, taken from the drawn wayPoints; for two
// of the sixteen lines the payload draws the stroke tip-first (the bulb circle
// sits on the *last* waypoint, not the first), so those two are listed
// reversed relative to the payload's own wayPoints array (noted per-line below).

const lines = [
  ['R2C3', 'R1C3', 'R1C2', 'R1C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['R2C8', 'R3C9', 'R2C9', 'R1C9'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R3C1', 'R2C2', 'R3C3'],
  ['R5C1', 'R4C1', 'R4C2', 'R4C3', 'R3C4'],
  ['R4C8', 'R4C7', 'R3C6', 'R3C5'], // drawn tip-first; bulb underlay at R4C8
  ['R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C8'], // drawn tip-first; bulb underlay at R7C8
  ['R5C7', 'R4C6', 'R4C5', 'R4C4', 'R5C4'],
  ['R5C5', 'R5C6', 'R6C7', 'R6C8'],
  ['R5C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R8C3', 'R9C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R7C9', 'R8C8', 'R7C7', 'R7C6', 'R7C5'],
  ['R9C7', 'R9C8', 'R8C9', 'R9C9'],
  ['R9C3', 'R9C2', 'R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new Or([
    new Thermo(...cells),
    new Arrow(...cells),
  ])),
];
