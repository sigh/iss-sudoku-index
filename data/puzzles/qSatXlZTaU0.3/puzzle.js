// Title: Clock Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=qSatXlZTaU0
// Source: https://tinyurl.com/bddhnmr3

// Normal Sudoku rules apply. In addition, the grid contains 8 four-cell
// digital displays; each must read a valid 24-hour time HH:MM (HH in
// 00-23, MM in 00-59), first two cells = HH, last two = MM. The colon
// text overlays in the source payload fix the HH|MM split point for each
// display (between the 2nd and 3rd cell).
//
// Because the grid's digit alphabet is 1-9 (no 0), the HH/MM range check
// reduces to a fixed pattern per display: 1st digit in {1,2}, and when it
// is 2 the 2nd digit in {1,2,3} (only hours 21-23 are reachable, since
// 20 would need a 0); 3rd digit in {1,2,3,4,5} (minutes tens digit --
// minutes never exceed 59); 4th digit unrestricted (any minutes units
// digit keeps the total <= 59 once the tens digit is <= 5).

const givens = [
  new Given('R1C7', 3), new Given('R1C8', 2), new Given('R1C9', 4),
  new Given('R2C1', 8), new Given('R2C9', 1),
  new Given('R3C1', 7),
  new Given('R5C4', 4), new Given('R5C6', 8),
  new Given('R7C9', 9),
  new Given('R8C1', 4), new Given('R8C9', 8),
  new Given('R9C1', 6), new Given('R9C2', 7), new Given('R9C3', 8),
];

// Each display's 4 cells, left to right, from the source `arrow` field
// (repurposed to draw the display box: each entry carries an empty
// `lines` and no bulb, so this is not a sum arrow). Order within each
// display is HH-tens, HH-units, MM-tens, MM-units.
const displays = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R6C4', 'R6C5', 'R6C6', 'R6C7'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
];

const CLOCK_PATTERN = '(1.|2[1-3])[1-5].';
const clocks = displays.map(cells => new Regex(CLOCK_PATTERN, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...clocks,
];
