// Title: Chinese Coin
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=TELB3fZDG2E
// Source: https://app.crackingthecryptic.com/sudoku/6nhndtjdHB

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, no givens).
//
// One thermometer: a square bulb plus a drawn line. Read two cells at a
// time away from the bulb, each pair is a two-digit number (first cell =
// tens, second cell = units), and the numbers must strictly increase along
// the thermometer.
//
// The square bulb underlay straddles R6C4/R6C5, unlike an ordinary 1-cell
// circular bulb; R6C4 is read as the extra bulb cell
// that supplies the tens digit of the first number, with the drawn line's
// own first cell R6C5 as that number's units digit. This is the only
// reading under which the thermometer's cell count is even (42, giving 21
// whole two-digit numbers) -- the drawn line alone has 41 cells, which
// cannot be split into complete two-digit numbers.
const thermoCells = [
  'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C6',
  'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R8C4',
  'R9C4', 'R9C3', 'R8C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C2',
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9',
  'R6C9', 'R7C9', 'R8C8', 'R9C7', 'R9C6', 'R9C5',
];

// Scans the 42-cell sequence two cells at a time. `tens` holds the first
// cell of the number currently being read (null while awaiting it); `prev`
// holds the previously completed number (null before the first). At each
// units cell the completed number must exceed `prev`. No digit is 0, so a
// completed number is always a genuine two-digit value (11-99) and the
// numeric and lexicographic (tens, then units) orderings coincide.
const thermoSpec = NFA.encodeSpec({
  startState: { tens: null, prev: null },
  transition: ({ tens, prev }, value) => {
    if (tens === null) return { tens: value, prev };
    const num = tens * 10 + value;
    if (prev !== null && num <= prev) return undefined;
    return { tens: null, prev: num };
  },
  accept: ({ tens }) => tens === null,
}, 9);

return [
  new Shape('9x9'),
  new NFA(thermoSpec, 'chinese-coin-thermo', ...thermoCells),
];
