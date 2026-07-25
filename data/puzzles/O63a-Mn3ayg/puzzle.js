// Title: Taxi Rank
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=O63a-Mn3ayg
// Source: https://sudokupad.app/61f9s2wmr3

// Normal sudoku rules apply (default row/column/box all-different).
//
// Nine coloured routes each run through 6 distinct cells, from a "square"
// marker cell to a "spot" marker cell. The routes group into three colours:
//   BLUE routes: box borders divide the route into segments of equal sum
//     (RegionSumLine already treats each box-crossing as a fresh segment).
//   GREEN routes: consecutive cells along the route differ by >= 5 (Whisper).
//   PINK routes: the 6 cells hold a non-repeating consecutive set of digits,
//     in any order (Renban).
// Route cell order is transcribed square-cell-first, spot-cell-last, from the
// drawn route lines and their coloured start/end markers; none of the three
// rule types above depends on this direction.
//
// Omitted: reading each route's 6 cells start-to-end as a 6-digit "route
// number" and ranking the nine numbers 1-9 is not encoded, because 5 of the
// 9 routes carry a "circled yellow taxi" giving that route's rank -- but the
// rank digit is drawn only as part of the taxi icon graphic and has no text
// value anywhere in the payload, so it cannot be recovered. What *is* stated
// in the rules text without needing those digits -- "None of the route
// numbers are the same" -- is kept below as a direct pairwise-distinctness
// constraint over the nine 6-digit numbers.

const blueRoutes = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R3C3', 'R2C4'],
  ['R9C2', 'R9C3', 'R8C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C6', 'R7C5', 'R7C4', 'R7C3', 'R8C2', 'R9C1'],
];

const greenRoutes = [
  ['R5C7', 'R5C6', 'R6C6', 'R6C7', 'R7C8', 'R7C9'],
  ['R3C7', 'R2C8', 'R3C8', 'R4C8', 'R4C9', 'R5C9'],
  ['R3C6', 'R2C5', 'R2C4', 'R1C4', 'R1C3', 'R2C3'],
];

const pinkRoutes = [
  ['R8C8', 'R8C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R2C9', 'R3C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4'],
  ['R4C3', 'R5C2', 'R6C2', 'R5C1', 'R6C1', 'R7C1'],
];

const allRoutes = [...blueRoutes, ...greenRoutes, ...pinkRoutes];

// "None of the route numbers are the same": for every pair of routes, at
// least one of the 6 aligned cell-pairs must differ (two routes matching in
// all 6 positions would spell equal 6-digit numbers). AllDifferent on a pair
// of cells is a plain not-equal; Or requires just one such position to hold.
// Two routes can share a physical cell (a spot marker where two routes'
// paths both end, e.g. R7C9 below) -- that aligned position can never
// differ, so it is dropped from its pair's Or rather than emitted as an
// unsatisfiable AllDifferent(cell, cell).
const distinctRouteNumbers = allRoutes.flatMap((routeA, i) =>
  allRoutes.slice(i + 1).map(routeB =>
    new Or(routeA
      .map((cellA, k) => [cellA, routeB[k]])
      .filter(([cellA, cellB]) => cellA !== cellB)
      .map(([cellA, cellB]) => new AllDifferent(cellA, cellB)))
  )
);

return [
  new Shape('9x9'),

  ...blueRoutes.map(cells => new RegionSumLine(...cells)),
  ...greenRoutes.map(cells => new Whisper(5, ...cells)),
  ...pinkRoutes.map(cells => new Renban(...cells)),

  ...distinctRouteNumbers,
];
