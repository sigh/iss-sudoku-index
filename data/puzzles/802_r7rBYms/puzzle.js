// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=802_r7rBYms
// Source: https://cracking-the-cryptic.web.app/sudoku/9qb7qPFgNm

// Normal Sudoku rules apply.
//
// The grey and green chains obey "Fibonacci rules" clockwise; starting with two
// single-digit numbers, each number in the series adds the last two numbers. The
// starting-point in the green chain is not shown.
//
// Read as: the digits along a chain, taken clockwise, spell one continuous series
// of numbers written without separators. The first two terms are single digits,
// every later term is the sum of the two before it, a multi-digit term occupies
// that many consecutive chain cells, and the series fills the chain exactly.
//
// Both chains are drawn as solid cell shading; the red arrow at the corner of
// R3C2/R3C3/R4C2/R4C3 points into R3C3 and marks where the grey series starts.
// Nothing is omitted.

// Shaded cells in clockwise drawn order. Grey: the ring of cells at Manhattan
// distance 4 from R5C5, minus R4C2, which is left unshaded and makes the chain
// open; it starts at the arrowed cell R3C3. Green: the closed ring at Manhattan
// distance 2 from R6C3, listed from its top cell.
const GREY = [
  'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9', 'R6C8',
  'R7C7', 'R8C6', 'R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1',
];
const GREEN = ['R4C3', 'R5C4', 'R6C5', 'R7C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2'];

// Every digit string a Fibonacci series can write into exactly n cells: both
// single-digit seeds run over 1..9, terms are concatenated in order, and a series
// is kept only if its written form lands exactly on the n-th cell. Strings holding
// a 0 are dropped because no cell of a 9x9 grid can take that digit.
const fibStrings = (n) => {
  const out = new Set();
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      let s = `${a}${b}`;
      let x = a;
      let y = b;
      while (s.length < n) {
        const z = x + y;
        s += z;
        x = y;
        y = z;
      }
      if (s.length === n && !s.includes('0')) out.add(s);
    }
  }
  return [...out];
};

// Regex matches the whole cell sequence, so an alternation of these strings also
// enforces that the series fills the chain exactly: 16 alternatives for the grey
// chain's 15 cells, 39 for the green chain's 8.
const greyPattern = fibStrings(GREY.length).join('|');
const greenPattern = fibStrings(GREEN.length).join('|');

// The green starting point is not shown, so read the closed ring from each of its
// eight cells in turn and require one of those readings to be a Fibonacci series.
const rotate = (cells, k) => cells.slice(k).concat(cells.slice(0, k));

return [
  new Shape('9x9'),

  // The 8 printed digits, none of which lies on either shaded chain.
  new Given('R2C1', 1),
  new Given('R2C5', 2),
  new Given('R4C4', 3),
  new Given('R5C6', 5),
  new Given('R7C8', 8),
  new Given('R9C1', 4),
  new Given('R9C7', 1),
  new Given('R9C8', 3),

  new Regex(greyPattern, ...GREY),
  new Or(GREEN.map((_, k) => new Regex(greenPattern, ...rotate(GREEN, k)))),
];
