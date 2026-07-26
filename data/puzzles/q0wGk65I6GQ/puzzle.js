// Title: Throuple Island
// Author: Belamis
// Video: https://www.youtube.com/watch?v=q0wGk65I6GQ
// Source: https://sudokupad.app/n045ji0xsw

// Normal sudoku (standard boxes) plus Kropki dots, decoded from the overlay
// marks: filled-black circles are black dots (ratio 1:2), white-filled
// black-outlined circles are white dots (consecutive).
//
// The grid is also divided into "islands" (orthogonally connected cell
// groups) and a single "ocean" of every other cell: no two islands touch
// orthogonally, the ocean is one orthogonally connected region that never
// completely fills a 2x2 area, each black dot connects two island cells,
// and each white dot connects one ocean cell and one island cell. This
// script models that division with a per-cell ISLAND/OCEAN overlay Var:
// - islands are never asserted as a single connected region -- only their
//   complement (the ocean) is, since ConnectedValues forces exactly one
//   component and there may be many islands;
// - "no two islands touch" needs no separate constraint: an island is just
//   a maximal connected blob of ISLAND cells, so two ISLAND cells that are
//   orthogonally adjacent are the same island by construction, never two
//   touching islands;
// - the "ocean never fills a 2x2" rule is enforced by requiring at least
//   one ISLAND cell in every 2x2 window, replicated from one template.
//
// Omitted: the "Throuple Island" rule itself -- each island contains
// exactly 3 different digits (repeats allowed) with the highest digit
// equal to the island's size -- needs a variable-size per-island label with
// per-label size/distinct-digit predicates, which ISS has no primitive for.

const ISLAND = 1;
const OCEAN = 2;

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const island = graph.makeOverlay('VI');

// Every island Var is either ISLAND or OCEAN.
const islandDomain = island.makeReplicate(
  new Given(island.cells()[0], ISLAND, OCEAN));

// The ocean is a single orthogonally-connected region (islands are not
// asserted connected as a group -- see header).
const oceanConnected = new ConnectedValues('VI', OCEAN);

// No 2x2 window is entirely ocean: each needs at least one ISLAND cell.
// Built once over the top-left block and replicated to every block origin.
const topLeftBlock = island.at(graph.block(gridCells[0], 2, 2));
const blockOrigins = island.at(
  gridCells.filter(cell => graph.block(cell, 2, 2)));
const noFullOcean2x2 = island.makeReplicate(
  new Or(topLeftBlock.map(cell => new Given(cell, ISLAND))),
  blockOrigins);

// Dot geometry: edge(cellA, cellB) pairs read from the drawn overlay marks.
// Black dots are filled black circles; white dots are white circles with a
// black outline.
const blackDots = [
  ['R1C1', 'R1C2'],
  ['R1C7', 'R1C8'],
  ['R5C2', 'R5C3'],
  ['R7C3', 'R7C4'],
];
const whiteDots = [
  ['R3C5', 'R4C5'],
  ['R3C8', 'R4C8'],
  ['R7C7', 'R7C8'],
  ['R8C8', 'R8C9'],
  ['R8C2', 'R9C2'],
];

// Kropki digit relations, independent of island/ocean membership.
const dotDigitRules = [
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];

// "Each black dot connects 2 island cells": both cells are ISLAND.
const blackDotMembership = blackDots.flatMap(([a, b]) => [
  new Given(island.at(a), ISLAND),
  new Given(island.at(b), ISLAND),
]);

// "Each white dot connects an ocean and island cell": the two cells differ,
// which for a 2-value domain means exactly one of each -- the encoding does
// not commit to which side is which.
const whiteDotMembership = whiteDots.map(
  ([a, b]) => new AllDifferent(...island.at([a, b])));

return [
  new Shape('9x9'),
  island.toVar('island'),
  new Given('R2C4', 3),
  islandDomain,
  oceanConnected,
  noFullOcean2x2,
  ...dotDigitRules,
  ...blackDotMembership,
  ...whiteDotMembership,
];
