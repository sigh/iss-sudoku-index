// Title: Rounding Errors
// Author: Eclectic Hoosier
// Video: https://www.youtube.com/watch?v=v0RrR9AMW-Y
// Source: https://app.crackingthecryptic.com/sudoku/7NLb3Mj896
//
// Normal sudoku. Digits in a cage cannot repeat and sum to a total that
// rounds to the cage's printed total (nearest 5). Digits along an arrow's
// tail sum to a total that rounds to the number printed in its circle
// (nearest 5); where two arrows share one circle they may have different
// real (unrounded) sums. The black dot joins two digits in an exact
// (unrounded) 1:2 ratio.
//
// Rounding-to-5 is unambiguous here: for an integer n, the nearest multiple
// of 5 is unique (a tie would need n to end in .5 relative to 5, impossible
// for an integer), so "n rounds to T" is exactly n in [T-2, T+2]. The
// worked example in the video description confirms this window: 3-7 round
// to 5, 8-12 round to 10. roundedTotals() enumerates that window as exact
// candidate totals, ORed together, since neither Cage nor Sum takes a
// range directly.
function roundedTotals(printedTotal) {
  const totals = [];
  for (let n = printedTotal - 2; n <= printedTotal + 2; n++) totals.push(n);
  return totals;
}

// A cage: no repeats plus a rounded total. Each candidate total is a
// separate Cage (which already implies AllDifferent), ORed together.
function roundedCage(printedTotal, ...cells) {
  return new Or(roundedTotals(printedTotal).map(n => new Cage(n, ...cells)));
}

// An arrow's tail: digits sum to a rounded total. Sum (not Cage) since the
// rule states no repeat-restriction for arrow digits; any distinctness
// here is incidental to shared rows in this puzzle, not part of the rule.
function roundedArrowTail(printedTotal, ...tailCells) {
  return new Or(roundedTotals(printedTotal).map(n => new Sum(n, ...tailCells)));
}

// Cage cells, transcribed from the drawn cage geometry.
const cages = [
  { total: 15, cells: ['R1C1', 'R2C1', 'R3C1'] },
  { total: 10, cells: ['R4C1', 'R5C1', 'R6C1'] },
  { total: 15, cells: ['R7C1', 'R8C1', 'R9C1'] },
  { total: 10, cells: ['R1C9', 'R2C9'] },
  { total: 10, cells: ['R3C9', 'R4C9'] },
  { total: 10, cells: ['R5C9', 'R6C9'] },
  { total: 20, cells: ['R7C9', 'R8C9', 'R9C9'] },
  { total: 30, cells: ['R6C7', 'R7C7', 'R7C6', 'R7C5'] },
  { total: 30, cells: ['R3C5', 'R3C4', 'R3C3', 'R4C3'] },
  { total: 30, cells: ['R3C6', 'R3C7', 'R4C7', 'R5C7'] },
  { total: 30, cells: ['R5C3', 'R6C3', 'R7C3', 'R7C4'] },
  { total: 25, cells: ['R5C4', 'R5C5', 'R5C6'] },
  { total: 5, cells: ['R6C4', 'R6C5'] },
  { total: 10, cells: ['R5C2', 'R6C2', 'R7C2', 'R8C2'] },
  { total: 10, cells: ['R9C4', 'R9C5'] },
];

// Arrow tails (bulb cell excluded -- see the header note on what the
// printed circle number means). Transcribed from the drawn arrow paths;
// the printed circle total is the numeral drawn on the bulb cell.
const arrowTails = [
  { total: 5, tail: ['R9C7', 'R9C6', 'R9C5'] }, // bulb R9C8
  { total: 5, tail: ['R8C7', 'R8C6'] },         // bulb R9C8 (shared circle)
  { total: 5, tail: ['R1C4', 'R1C5', 'R1C6'] }, // bulb R1C3
];

// The printed number in an arrow's circle is drawn as an ordinary given
// digit at the bulb cell (the payload's standard given-digit field, the
// same one every other given in this corpus uses -- there is no separate
// display-only text field for a number drawn inside a grid cell). It is
// also the rounded arrow total the rules describe. Both facts hold at
// once: the bulb cell's own digit is fixed, and separately each arrow's
// real tail sum must round to it.

// Black dot, drawn on the edge between R3C5 and R4C5. BlackDot fixes the
// exact (unrounded) 2:1 ratio.
return [
  new Shape('9x9'),
  new Given('R1C3', 5),
  new Given('R9C8', 5),
  ...cages.map(({ total, cells }) => roundedCage(total, ...cells)),
  ...arrowTails.map(({ total, tail }) => roundedArrowTail(total, ...tail)),
  new BlackDot('R3C5', 'R4C5'),
];
