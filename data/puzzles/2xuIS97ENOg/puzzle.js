// Title: How Bizarre
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=2xuIS97ENOg
// Source: https://sudokupad.app/Td2qPdqdHj

// Normal Sudoku rules apply. R4C5 is odd. Each grey line is split into at
// least two segments with one shared sum; every segment is a non-repeating,
// consecutive set of digits in any order.
const isConsecutiveSet = (mask) => {
  const lowestBit = mask & -mask;
  const normalized = mask / lowestBit;
  return (normalized & (normalized + 1)) === 0;
};

const makeBizarreSegments = (lineLength) => {
  const consecutiveMasks = Array.from({ length: 511 }, (_, index) => index + 1)
    .filter(isConsecutiveSet);
  const maskSum = (mask) => Array.from({ length: 9 }, (_, index) => (
    mask & (1 << index) ? index + 1 : 0
  )).reduce((sum, value) => sum + value, 0);
  const maskLength = (mask) => mask.toString(2).replaceAll('0', '').length;
  // A shared total is possible only when two consecutive sets with that total
  // fit on this particular path. This bounds the automaton without pruning a
  // legal segmentation.
  const feasibleTargets = new Set(consecutiveMasks.filter((first) => (
    consecutiveMasks.some((second) => (
      maskSum(first) === maskSum(second)
      && maskLength(first) + maskLength(second) <= lineLength
    ))
  )).map(maskSum));
  const canComplete = (mask, target) => consecutiveMasks.some((candidate) => (
    (target === null || maskSum(candidate) === target) && (candidate & mask) === mask
  ));

  return NFA.encodeSpec({
  // `target` is set by the first completed segment. `hasBreak` records that
  // segment boundary, so acceptance requires at least two segments.
  startState: { target: null, sum: 0, mask: 0, hasBreak: false },
  transition({ target, sum, mask, hasBreak }, value) {
    const bit = 1 << (value - 1);
    const next = [];
    const extendedMask = mask | bit;
    const extendedSum = sum + value;

    // Continue the current segment without repeats. Consecutiveness is checked
    // only when a segment ends: an arbitrary ordering can have a non-consecutive
    // prefix even though its completed set is consecutive.
    if ((mask & bit) === 0 && (target === null || extendedSum <= target)
        && canComplete(extendedMask, target)) {
      next.push({ target, sum: extendedSum, mask: extendedMask, hasBreak });
    }

    // A boundary lies before this digit. The completed segment establishes,
    // or matches, the line's shared sum; this digit begins the next segment.
    if (sum > 0 && isConsecutiveSet(mask) && (target === null || sum === target)
        && (target !== null || feasibleTargets.has(sum))
        && (target === null || value <= target)
        && canComplete(bit, target === null ? sum : target)) {
      next.push({ target: target === null ? sum : target, sum: value, mask: bit,
        hasBreak: true });
    }
    return next;
  },
  accept: ({ target, sum, mask, hasBreak }) => (
    hasBreak && sum === target && isConsecutiveSet(mask)
  ),
    maxDepth: lineLength,
  }, 9);
};

// Grey-line paths transcribed from the drawing, in waypoint order.
const greyLines = [
  ['R1C8', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6',
    'R7C6', 'R8C6', 'R8C7', 'R8C8'],
  ['R6C7', 'R7C8', 'R7C9'],
  ['R4C8', 'R4C9', 'R3C9'],
  ['R8C2', 'R8C3', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4',
    'R2C4', 'R1C4', 'R1C3', 'R1C2'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C4'],
  ['R6C3', 'R5C2', 'R4C2', 'R3C1'],
  ['R7C1', 'R6C2', 'R7C3'],
];

return [
  new Shape('9x9'),
  new Given('R4C5', 1, 3, 5, 7, 9),
  ...greyLines.map((line, index) => (
    new NFA(makeBizarreSegments(line.length), `grey ${index + 1}`, ...line)
  )),
];
