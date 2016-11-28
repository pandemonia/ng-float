/**
 * A service to position items in fl-container.
 *
 * Divided into stateless granular functions to make testing easier.
 */
export default function () {
  /**
   * The entry point for this service. Positions the items based on the given configuration
   */
  function position(items) {
    const start = performance.now();

    const rows = makeRows(items);
    console.debug(rows);

    // for (let i = 0; i < rows.length; i++) {
    //   const overflow = checkItemCollisions(rows[i]);

    //   if (overflow.length > 0) {
    //     rows.splice(i, 0, [makeRow(overflow, rows[i].top)]);
    //     i--;
    //   }
    // }

    console.debug('service.position', performance.now() - start);

    // Return the array of items ordered by row and column
    return rows.reduce((arr, row) => arr.concat(row.items), []);
  }

  /**
   * Use a hashmap to categorize items by top position.
   *
   * @return An array with two parameters, a top position and an array of items
   */
  function makeRows(items) {
    const topHashMap = {};

    items.forEach(item => {
      if (!(item.layout.top in topHashMap)) {
        topHashMap[item.layout.top] = [];
      }

      topHashMap[item.layout.top].push(item);
    });

    return Object.keys(topHashMap).map(top => makeRow(topHashMap[top], top));
  }

  function makeRow(items, top) {
    return {
      top: top,
      items: items
    };
  }

  // This is a helper
  function _clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  return {
    position: position,
  };
};

