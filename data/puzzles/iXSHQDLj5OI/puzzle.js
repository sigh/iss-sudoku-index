// Title: Olympics
// Author: Civil
// Video: https://www.youtube.com/watch?v=iXSHQDLj5OI
// Source: https://app.crackingthecryptic.com/sudoku/hnMJTRhdrT

// Rules
//   Normal sudoku rules apply.
//   All digits in the colored cells are part of at least one (summer) Olympic
//   year. The years are depicted in orthogonally adjacent consecutive digits.
//   All (summer) Olympic years are present, except Olympic years with double
//   digits (e.g. 1912) or with zeros (e.g. 1904). Not all possible combinations
//   within the colored area are depicting Olympic years.
//   Digits joined by a black dot have a ratio of 1:2. All possible black dots
//   are given.
//   (The Olympics began in 1896 and have occurred every four years since,
//   excluding 1916, 1940 and 1944.)
//
// Nothing is encoded for "Not all possible combinations within the colored
// area are depicting Olympic years": read as a constraint it asks only that
// some four-cell run in the colored area is not an Olympic year, and every
// qualifying year reversed (6981, 4291, ... 4891) is not itself a qualifying
// year, so each run and its reverse cannot both be years and the clause holds
// for any grid.

const graph = cellGraph('9x9');

// The 35 orange-shaded cells (underlays, fill #EB7532).
const colored = [
  'R1C2', 'R1C3', 'R1C4', 'R1C5',
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
  'R3C6', 'R3C7', 'R3C8', 'R3C9',
  'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8',
  'R5C1', 'R5C2',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C8', 'R7C9',
  'R8C3', 'R8C8', 'R8C9',
];

// The 16 drawn black dots, as the cell pair each one straddles.
const blackDotEdges = [
  ['R1C4', 'R2C4'], ['R2C2', 'R2C3'], ['R2C6', 'R3C6'], ['R3C8', 'R4C8'],
  ['R3C9', 'R4C9'], ['R4C8', 'R4C9'], ['R5C1', 'R5C2'], ['R5C4', 'R6C4'],
  ['R5C6', 'R6C6'], ['R6C6', 'R7C6'], ['R7C8', 'R8C8'], ['R8C2', 'R8C3'],
  ['R8C3', 'R9C3'], ['R8C4', 'R8C5'], ['R8C7', 'R9C7'], ['R9C6', 'R9C7'],
];

// Summer Olympic years, then the rules' two exclusions: a repeated digit
// ("double digits", e.g. 1912) and a zero (e.g. 1904). Every year from 2000 on
// contains a zero, so the surviving list does not depend on where the sequence
// is stopped. 13 years survive: 1896, 1924, 1928, 1932, 1936, 1948, 1952,
// 1956, 1964, 1968, 1972, 1976, 1984.
const cancelled = new Set([1916, 1940, 1944]);
const years = [];
for (let year = 1896; year <= 2020; year += 4) {
  const digits = String(year);
  if (cancelled.has(year)) continue;
  if (digits.includes('0')) continue;
  if (new Set(digits).size !== digits.length) continue;
  years.push(digits);
}

// Every way a four-digit year could be written in the colored area: the
// directed four-cell paths of orthogonally adjacent colored cells. A path
// never revisits a cell because no surviving year repeats a digit. The paths
// stay inside the colored area because the rules place the candidate
// depictions there ("combinations within the colored area").
const coloredSet = new Set(colored);
const paths = [];
const extendPath = (path) => {
  if (path.length === 4) {
    paths.push(path);
    return;
  }
  for (const next of graph.neighbours(path[path.length - 1])) {
    if (coloredSet.has(next) && !path.includes(next)) {
      extendPath([...path, next]);
    }
  }
};
for (const cell of colored) extendPath([cell]);

// Each year is written somewhere in the colored area.
const yearsPresent = years.map(
  year => new Or(paths.map(path => new Regex(year, ...path))));

// Each colored digit belongs to at least one written year: some path through
// that cell spells one of the years.
const anyYear = years.join('|');
const digitsInAYear = colored.map(
  cell => new Or(
    paths.filter(path => path.includes(cell)).map(
      path => new Regex(anyYear, ...path))));

// "All possible black dots are given": no undotted orthogonally adjacent pair
// may be in 1:2 ratio. One Replicate per edge direction stamps that negative
// onto every undotted pair; the right-neighbour and down-neighbour templates
// are the two offsets an orthogonal pair can have.
const notDouble = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const dottedEdges = new Set(blackDotEdges.map(edge => edge.join()));
const noUndottedDouble = [[0, 1], [1, 0]].map(([dR, dC]) => {
  const targets = graph.cells().filter(cell => {
    const other = graph.step(cell, dR, dC);
    return other !== null && !dottedEdges.has([cell, other].join());
  });
  const template = new Pair(
    notDouble, 'not 1:2', 'R1C1', makeCellId({ row: 1 + dR, col: 1 + dC }));
  return graph.makeReplicate(template, targets);
});

return [
  new Shape('9x9'),

  new Given('R1C5', 8),
  new Given('R9C9', 7),

  ...yearsPresent,
  ...digitsInAYear,

  ...blackDotEdges.map(edge => new BlackDot(...edge)),
  ...noUndottedDouble,
];
