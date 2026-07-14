// Title: Zebra Knights
// Author: R. Mullinix
// Video: https://www.youtube.com/watch?v=8zHIxRFOX9c
// Source: https://sudokupad.app/uwqqgafi9m

// Normal sudoku rules apply. Antiknight: cells a knight's move apart cannot
// repeat a digit.
//
// Ruleset rule: "For all rules below, do not duplicate any digit within a
// ruleset" -- e.g. a digit on one Renban line cannot appear on any other
// Renban line. This applies separately to each of the four rule types below
// (Renban, Thermometer, Kropki dot, Killer cage): all cells belonging to any
// instance of that type, across the whole grid, must hold distinct digits.
// Each type's own local rule (consecutive set / strictly increasing / cage
// no-repeat) already forbids a repeat *within* one instance of that type;
// the extra AllDifferent below is the *inter*-instance half of the rule.
//
// Renban (purple line): digits along the line form a set of consecutive
// digits, in any order.
// Thermometer (grey line, thicker than the Renban lines): digits increase
// from the bulb (fat end) to the tip.
// Kropki dot (white): the two joined cells hold consecutive digits.
// Killer cage: digits in the cage do not repeat. Neither cage here has a
// printed total.

const renbanLines = [
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R3C1', 'R3C2', 'R2C3'],
];

const thermometers = [
  ['R4C1', 'R4C2', 'R4C3', 'R5C4', 'R4C5'], // R5C4 is also the first cell of Renban line 1
  ['R5C3', 'R5C2'],
  ['R4C8', 'R4C9'],
];

const kropkiDots = [
  ['R3C4', 'R3C5'],
  ['R6C8', 'R6C9'], // this edge lies on Renban line 2
  ['R8C5', 'R8C6'], // this edge lies inside killer cage 1
];

const killerCages = [
  ['R8C4', 'R8C5', 'R8C6'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R6C3', 'R6C4', 'R6C5'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),

  new Given('R1C9', 4),
  new Given('R2C1', 8),

  ...renbanLines.map(cells => new Renban(...cells)),
  new AllDifferent(...renbanLines.flat()), // ruleset: no digit twice across the 3 Renban lines

  ...thermometers.map(cells => new Thermo(...cells)),
  new AllDifferent(...thermometers.flat()), // ruleset: no digit twice across the 3 thermometers

  ...kropkiDots.map(([a, b]) => new WhiteDot(a, b)),
  new AllDifferent(...kropkiDots.flat()), // ruleset: no digit twice across the 3 white dots

  ...killerCages.map(cells => new AllDifferent(...cells)), // no total: cage no-repeat only
  new AllDifferent(...killerCages.flat()), // ruleset: no digit twice across the 3 cages
];
