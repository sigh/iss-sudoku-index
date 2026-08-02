// Title: EnTropic Islands
// Author: Paletron
// Video: https://www.youtube.com/watch?v=yLtSakd0dps
// Source: https://app.crackingthecryptic.com/sudoku/PgPqh88p3j

// Normal sudoku rules apply.
//
// The arrow between R3C1 and R3C2 points to the smaller digit.
//
// Omitted: digits belong to Low (1-3), Mid (4-6), or High (7-9) entropy
// groups. Each circled digit gives the size of its orthogonally connected
// same-group island. This requires finding many unknown connected components
// and relating each component's size to a member-cell digit; ISS has no
// faithful component-size predicate for that discovered partition.

return [
  new Shape('9x9'),
  new GreaterThan('R3C1', 'R3C2'),
];
