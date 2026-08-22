// Title: Lady Or The Tiger
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=h8m3GwzWRpw
// Source: https://app.crackingthecryptic.com/sudoku/6nb6Ndf63L

// Normal sudoku rules apply. In cages, digits sum to the small clue in the top
// left corner of the cage (no total is printed, so the cage is a killer cage
// with distinct digits summing to the stored total). Digits along an arrow sum
// to the digit in that arrow's circle. Cells with a (solid) grey circle must
// contain an odd digit. Cells separated by a white dot contain consecutive
// digits; cells separated by a black dot have a 1:2 ratio. Not all dots are
// given, so an undotted pair carries no restriction.
//
// Riddle part (Smullyan's "Lady or the Tiger"): each of the three 30-cage
// "rooms" hides either the lady (digit 1, and no 9 anywhere in that room) or
// a tiger (digit 9, and no 1 anywhere in that room); two rooms hide a tiger,
// one hides the lady. The room signs are: Room 1 "a tiger is in room 2",
// Room 2 "a tiger is in this room", Room 3 "a tiger is in room 1". The king
// states the lady's room's sign is true and at least one of the other two
// signs is false. This is encoded as a disjunction over which room holds
// the lady (see `ladyBranch` below): each branch states the room/tiger
// assignment it implies and the resulting sign-truth requirements from the
// king's statement, so the branch for a room the king's statement actually
// rules out is left self-contradictory for the solver to discover, rather
// than the encoding omitting or hand-picking a winner.

const room1 = ['R7C2', 'R7C3', 'R8C2', 'R8C3', 'R9C2', 'R9C3'];
const room2 = ['R7C5', 'R7C6', 'R8C5', 'R8C6', 'R9C5', 'R9C6'];
const room3 = ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C8', 'R9C9'];
const roomCells = [room1, room2, room3];

// Rooms 1-3 are read left-to-right off the red room-number labels given at
// R5C3=1, R5C6=2, R5C9=3, directly above each room's cage column-pair.
const noNine = [1, 2, 3, 4, 5, 6, 7, 8];
const noOne = [2, 3, 4, 5, 6, 7, 8, 9];

// Sign N's stated subject room, in reading order (0-indexed): sign1 "a
// tiger is in room2", sign2 "a tiger is in this room" (room2's own sign),
// sign3 "a tiger is in room1". A sign is true iff its subject room holds
// the tiger (contains a 9).
const signSubject = [room2, room2, room1];

// One branch per candidate lady room: fixes that room's cage to lady
// (contains 1, no 9) and the other two to tiger (contain 9, no 1), then
// states the king's claim -- lady's own sign true, at least one of the
// other two signs false -- as ContainAtLeast/no-9 facts about the signs'
// subject rooms. A branch whose king-claim contradicts its own room
// assignment (e.g. the lady's sign demanding a 9 in her own no-9 room) is
// left in as a self-contradictory And; the solver rules it out via the
// cage/domain conflict rather than the encoding picking a winner.
function ladyBranch(ladyIndex) {
  const ladyCells = roomCells[ladyIndex];
  const tigerIndices = [0, 1, 2].filter(i => i !== ladyIndex);

  const roomAssignment = [
    new ContainAtLeast('1', ...ladyCells),
    ...ladyCells.map(cell => new Given(cell, ...noNine)),
    ...tigerIndices.flatMap(i => [
      new ContainAtLeast('9', ...roomCells[i]),
      ...roomCells[i].map(cell => new Given(cell, ...noOne)),
    ]),
  ];

  // Lady's own sign (index === ladyIndex) must be true.
  const ownSignTrue = new ContainAtLeast('9', ...signSubject[ladyIndex]);

  // At least one of the other two rooms' signs must be false; "false"
  // for a sign is "its subject room has no 9".
  const otherSignFalse = tigerIndices.map(i =>
    new And(signSubject[i].map(cell => new Given(cell, ...noNine)))
  );

  return new And([...roomAssignment, ownSignTrue, new Or(otherSignFalse)]);
}

return [
  new Shape('9x9'),

  // Givens, including the red room-number labels (R5C3/R5C6/R5C9) and the
  // three arrow bulbs (R1C8/R2C5/R3C2), all provenanced above.
  new Given('R1C8', 9),
  new Given('R2C5', 9),
  new Given('R3C2', 9),
  new Given('R5C3', 1),
  new Given('R5C6', 2),
  new Given('R5C9', 3),

  // Three 6-cell, sum-30 killer cages: rows 7-9, each spanning one
  // column-pair, matching the drawn cage outlines and yellowgreen underlays.
  new Cage(30, ...room1),
  new Cage(30, ...room2),
  new Cage(30, ...room3),

  // Riddle: exactly one of the three rooms holds the lady; see `ladyBranch`
  // above for what each branch encodes.
  new Or([0, 1, 2].map(ladyBranch)),

  // Odd-digit (solid grey circle) cells -- provenance: the three solid-grey
  // underlay circles (fill and border both grey), distinct from the
  // white-filled grey-bordered circles that are the arrow bulbs above.
  new Given('R8C3', 1, 3, 5, 7, 9),
  new Given('R8C6', 1, 3, 5, 7, 9),
  new Given('R8C9', 1, 3, 5, 7, 9),

  // Arrows -- a fourth drawn arrow entry has no waypoints and renders
  // nothing, so it is not a clue and is not encoded. Each bulb cell
  // coincides with one of the digit-9 givens above.
  new Arrow('R3C2', 'R2C3', 'R3C4', 'R4C5'),
  new Arrow('R2C5', 'R3C6', 'R4C6'),
  new Arrow('R1C8', 'R1C7', 'R2C6', 'R3C5', 'R4C4'),

  // White (consecutive) dots -- provenance: overlays with white fill / black
  // border.
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R7C3', 'R7C4'),
  new WhiteDot('R6C6', 'R7C6'),
  new WhiteDot('R7C6', 'R7C7'),
  new WhiteDot('R6C9', 'R7C9'),

  // Black (1:2 ratio) dots -- provenance: overlays with black fill / black
  // border.
  new BlackDot('R7C1', 'R7C2'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R7C4', 'R7C5'),
  new BlackDot('R9C4', 'R9C5'),
  new BlackDot('R7C7', 'R7C8'),
  new BlackDot('R9C7', 'R9C8'),
];
