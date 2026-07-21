// Title: Counterproductive
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=1Jm6F20EbrQ
// Source: https://sudokupad.app/k9rhoxxjvs

// Every cage product equals the number of cages having that product. A product
// is viable only when at least that many drawn cages can make it. One NFA per
// cage restricts its product to that derived set; one counting NFA per viable
// product enforces that its frequency is either zero or the product itself.

const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R8C9', 'R9C8', 'R9C9'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R2C2', 'R2C3'],
  ['R3C7', 'R3C8'],
  ['R7C2', 'R7C3'],
  ['R8C7', 'R8C8'],
  ['R7C5', 'R7C6'],
  ['R3C4', 'R3C5'],
  ['R2C6', 'R3C6', 'R4C6'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R5C8', 'R5C9'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R1C7'],
  ['R8C2'],
  ['R8C3'],
  ['R9C3'],
  ['R4C7'],
  ['R1C4'],
  ['R9C4'],
  ['R9C5'],
  ['R9C6'],
  ['R4C5'],
  ['R4C8'],
  ['R6C8'],
  ['R7C8'],
  ['R2C7'],
  ['R2C4'],
  ['R7C7'],
  ['R6C4', 'R7C4'],
  ['R2C5'],
  ['R8C6'],
  ['R5C7'],
  ['R6C2'],
  ['R5C6'],
];

const largestPossibleFrequency = cages.length;

function productsForLength(length) {
  const products = new Set();
  function visit(remaining, product) {
    if (remaining === 0) {
      if (product <= largestPossibleFrequency) products.add(product);
      return;
    }
    for (let digit = 1; digit <= 9; digit++) {
      if (product * digit <= largestPossibleFrequency) {
        visit(remaining - 1, product * digit);
      }
    }
  }
  visit(length, 1);
  return products;
}

const productsByLength = new Map(
  [...new Set(cages.map(cage => cage.length))]
    .map(length => [length, productsForLength(length)]),
);
const cagesForProduct = product => cages.filter(cage =>
  productsByLength.get(cage.length).has(product));
const viableProducts = [...Array(largestPossibleFrequency)].map((_, i) => i + 1)
  .filter(product => cagesForProduct(product).length >= product);
const viableProductSet = new Set(viableProducts);

const viableProductSpec = NFA.encodeSpec({
  startState: { product: 1 },
  transition: ({ product }, value) => {
    const nextProduct = product * value;
    return nextProduct <= largestPossibleFrequency
      ? { product: nextProduct }
      : undefined;
  },
  accept: ({ product }) => viableProductSet.has(product),
}, 9);

function frequencySpec(target) {
  return NFA.encodeSpec({
    startState: { product: 1, count: 0 },
    transition: ({ product, count }, value) => {
      if (value === SEGMENT_BREAK) {
        const nextCount = count + (product === target ? 1 : 0);
        return nextCount <= target
          ? { product: 1, count: nextCount }
          : undefined;
      }
      return {
        product: Math.min(target + 1, product * value),
        count,
      };
    },
    accept: ({ product, count }) => {
      const finalCount = count + (product === target ? 1 : 0);
      return finalCount === 0 || finalCount === target;
    },
  }, 9, { multiSegment: true });
}

return [
  new Shape('9x9'),
  new Given('R3C1', 7),
  new Given('R7C9', 5),
  ...cages.map(cage => new NFA(viableProductSpec, 'viable cage product', ...cage)),
  ...viableProducts.map(target => new NFA(
    frequencySpec(target),
    `count(product ${target})`,
    ...cagesForProduct(target),
  )),
];
