// Title: False Alibi Sudoku
// Author: Reverend
// Video: https://www.youtube.com/watch?v=Ss-gJSwmd8w
// Source: https://app.crackingthecryptic.com/webapp/rpP7FHfLLD

// Rules: normal sudoku, plus: each digit 1-9 has a cell holding it that is
// a king's move away from two other cells holding that same digit; exactly
// one digit has two such cells (every other digit has exactly one).
//
// This is encoded in two passes over a per-cell "Hub" overlay:
//  1. For every grid cell, an NFA reads that cell, its up-to-eight king-move
//     neighbours, and a paired Hub Var, and forces the Hub Var to 2 (hub) iff
//     at least two of the neighbours share the cell's own digit, else 1.
//  2. For every digit 1-9, an NFA scans all 81 (cell, Hub) pairs and counts
//     how many hub cells hold that digit, rejecting once the count would
//     exceed 2 and accepting only a final count of 1 or 2 -- this is the "at
//     least one, at most two" half of the rule for that digit.
// A plain Sum over all Hub values then pins the total number of hub cells to
// 10 (81 base + 1 per hub cell): combined with every digit's count already
// capped at 1 or 2, a total of 10 across nine digits forces exactly one digit
// to reach 2 and the rest to land on 1 -- the "one number seen twice" half.

const graph = cellGraph('9x9');
const hub = graph.makeOverlay('VH');

// Reject convention throughout: transition returns undefined to kill a branch.

// Per-cell hub determination. Sequence is [cell, ...kingNeighbours(cell), hub(cell)].
// State steps through: read center digit (step 0), tally matches among the
// neighbours (steps 1..neighborCount), then check the trailing Hub value
// against the tally (step neighborCount+1, the sink "done" step).
function hubSpec(neighborCount) {
  return NFA.encodeSpec({
    startState: { step: 0, center: null, count: 0 },
    transition: ({ step, center, count }, value) => {
      if (step === 0) return { step: 1, center: value, count: 0 };
      if (step <= neighborCount) {
        const matched = value === center;
        return { step: step + 1, center, count: Math.min(count + (matched ? 1 : 0), 2) };
      }
      // step === neighborCount + 1: this value is the paired Hub var (1 or 2).
      const isHub = value === 2;
      if (isHub !== (count >= 2)) return undefined;
      return { step: step + 1, center, count };
    },
    accept: ({ step }) => step === neighborCount + 2,
    // Sequence is always exactly [cell, ...neighbours, hub]: bound compile-time
    // exploration to that length so `step` cannot climb without limit.
    maxDepth: neighborCount + 2,
  }, 9);
}

function hubNFAs() {
  return graph.cells().map(cell => {
    const neighbours = graph.kingNeighbours(cell);
    return new NFA(
      hubSpec(neighbours.length),
      `Hub@${cell}`,
      cell, ...neighbours, hub.at(cell),
    );
  });
}

// Per-digit hub count. Sequence is [cell1, hub(cell1), cell2, hub(cell2), ...]
// over every grid cell, in any order. Tracks (in `count`) how many cells hold
// `digit` and are marked as a hub; `pendingMatch` carries whether the cell
// just read equals `digit`, cleared once its paired hub value is consumed.
function digitHubCountSpec(digit) {
  return NFA.encodeSpec({
    startState: { count: 0, pendingMatch: undefined },
    transition: ({ count, pendingMatch }, value) => {
      if (pendingMatch === undefined) {
        return { count, pendingMatch: value === digit };
      }
      const isHub = value === 2;
      const newCount = (pendingMatch && isHub) ? count + 1 : count;
      if (newCount > 2) return undefined; // more than two hubs for this digit
      return { count: newCount, pendingMatch: undefined };
    },
    accept: ({ count, pendingMatch }) => pendingMatch === undefined && (count === 1 || count === 2),
  }, 9);
}

function digitHubCountNFAs() {
  const allHubEntries = graph.cells().flatMap(cell => [cell, hub.at(cell)]);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit =>
    new NFA(digitHubCountSpec(digit), `HubCount${digit}`, ...allHubEntries));
}

return [
  new Shape('9x9'),
  new Given('R1C1', 2),
  new Given('R1C9', 4),
  new Given('R2C6', 9),
  new Given('R2C8', 2),
  new Given('R4C4', 2),
  new Given('R4C5', 6),
  new Given('R4C6', 1),
  new Given('R5C5', 5),
  new Given('R7C2', 6),
  new Given('R7C9', 7),
  new Given('R8C3', 3),
  new Given('R9C5', 8),
  hub.toVar('Hub'),
  // All 81 Hub cells are restricted to {1 = not-a-hub, 2 = hub}; one template
  // shifted across the whole overlay rather than 81 separate Givens.
  hub.makeReplicate(new Given(hub.cells()[0], 1, 2)),
  ...hubNFAs(),
  ...digitHubCountNFAs(),
  new Sum(91, ...hub.at(graph.cells())),
];
