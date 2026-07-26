// Title: 3
// Author: eevee
// Video: https://www.youtube.com/watch?v=YrLnNecIE3o
// Source: https://sudokupad.app/eu8ylhn5ta

// Normal sudoku rules apply (rows, columns, and boxes all-different; the boxes
// are the default 3x3 tiling, matching the puzzle's `regions`, so no explicit
// region constraint is needed).
//
// Killer: digits in each cage do not repeat and sum to the printed total.
//
// Prime Takuzu: no three contiguous digits in any row or column may be all
// prime (2, 3, 5, 7) or all composite (4, 6, 8, 9); 1 is neither, so any
// window containing a 1 automatically satisfies the rule.

const PRIMES = new Set([2, 3, 5, 7]);
const COMPOSITES = new Set([4, 6, 8, 9]);
const category = (value) =>
  PRIMES.has(value) ? 'P' : COMPOSITES.has(value) ? 'C' : 'N';

// Cage cells and totals transcribed from the puzzle's drawn cage geometry;
// each cage's first listed cell is its top-left (total) cell.
const killerCages = [
  new Cage(23, 'R3C8', 'R4C8', 'R4C9'),
  new Cage(21, 'R4C1', 'R4C2', 'R5C2'),
  new Cage(9, 'R6C4', 'R6C5', 'R7C5'),
  new Cage(10, 'R2C5', 'R3C5', 'R4C5'),
  new Cage(6, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(21, 'R8C2', 'R9C1', 'R9C2'),
  new Cage(11, 'R1C3', 'R2C3', 'R3C3'),
  new Cage(10, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(17, 'R5C6', 'R5C7', 'R6C7'),
  new Cage(14, 'R1C8', 'R1C9', 'R2C9'),
];

// Prime Takuzu NFA: scans a line left-to-right (or top-to-bottom) tracking the
// category ('P'/'C'/'N') of the previous two cells. Rejects as soon as three
// consecutive cells share category 'P' or 'C' ('N' triples are allowed, since
// 1 is neither prime nor composite). This checks every sliding 3-cell window,
// matching "any three contiguous digits".
const primeTakuzuSpec = NFA.encodeSpec({
  startState: { prev: null, prevPrev: null },
  transition: ({ prev, prevPrev }, value) => {
    const cat = category(value);
    if (prevPrev !== null && prevPrev === prev && prev === cat && cat !== 'N') {
      return undefined;
    }
    return { prev: cat, prevPrev: prev };
  },
  accept: () => true,
}, 9);

const graph = cellGraph('9x9');
const primeTakuzuLines = [...graph.rows(), ...graph.columns()].map(
  (cells) => new NFA(primeTakuzuSpec, 'PrimeTakuzu', ...cells));

return [
  new Shape('9x9'),
  ...killerCages,
  ...primeTakuzuLines,
];
