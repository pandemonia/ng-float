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

    for (let i = 0; i < rows.length;) {
      console.debug(rows[i]);
      const overflow = checkItemCollisions(rows[i].items);

      if (overflow.length > 0) {
        rows.splice(i, 0, makeRow(overflow, rows[i].top + 1));
      } else {
        i++;
      }
    }

    rows.sort((a, b) => a.top - b.top);

    rows.forEach(row => console.debug(row.top, row.items));

    let diff = 0;
    for (let i = 0; i < rows.length; i++) {
      if (i > 0) {
        diff = getRowDiff(rows[i - 1], rows[i]);
      } else {
        diff = rows[i].top;
      }

      for (let j = i; j < rows.length; j++) {
        if (diff !== 0) {
          console.debug('Moving row ' + j + ' by ' + diff);
        }
        rows[j].top -= diff;
      }
    }

    rows.forEach(row => {
      row.items.forEach(item => {
        item.layout.top = row.top;
      });
    });

    console.debug('service.position', performance.now() - start);

    // Return the array of items ordered by row and column
    return rows.reduce((arr, row) => arr.concat(row.items), []);
  }

  function checkItemCollisions(items) {
    console.debug(items);
    items.sort((a, b) => a.layout.left - b.layout.left);

    const overflow = [];
    for (let i = 0; i < items.length - 2; i) {
      if (items[i].layout.left + items[i].layout.width > items[i + 1].layout.left) {
        console.debug('overlap');
        overflow.push(items.splice(i + 1, 1)[0]);
      } else {
        i++;
      }
    }

    return overflow;
  }

  /**
   * Compares two rows and returns by how much the second row should move by
   * if the rows are to be on top of each other without overlap
   *
   * @return A number: negative indicating an overlap, positive indicating a gap
   */
  function getRowDiff(topRow, bottomRow) {
    return 0;
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

    return Object.keys(topHashMap).map(top => makeRow(topHashMap[top], Number(top)));
  }

  function makeRow(items, top) {
    return {
      top: top,
      items: items
    };
  }

  return {
    position: position,
  };
};

