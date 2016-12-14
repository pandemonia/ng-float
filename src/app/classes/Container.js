import Row from './Row'

export default class Container {
  constructor(items = []) {
    this.rows = this.itemsToRows(items);
  }

  itemsToRows(items) {
    const topMap = {};

    items.forEach(item => {
      if (item.top in topMap) {
        topMap[item.top].push(item);
      } else {
        topMap[item.top] = [item];
      }
    });

    return Object.entries(topMap).map(([top, items]) => {
      return new Row(items, Number(top), this)
    }).sort((a, b) => a.top - b.top);
  }

  addItem(item) {
    let rowIndex, itemRow;

    // Push the item down till it does not overlap with a row above it
    for (rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
      if (this.rows[rowIndex].top < item.top) {
        item.top += this.rows[rowIndex].getOverlap(item, false);
      } else {
        if (this.rows[rowIndex].top === item.top) {
          itemRow = this.rows[rowIndex];
        }
        break;
      }
    }

    // If a row is already present with which it does not overlap, add it there
    if (itemRow && !itemRow.getOverlap(item, true)) {
      itemRow.addItem(item);
    } else { // Else create a new row before the currently reached index
      this.rows.splice(rowIndex, 0, new Row([item], item.top, this));
    }

    // Iterate through all the remaining rows and push them by the amount of overlap
    for (let i = rowIndex + 1; i < this.rows.length; i++) {
      this.shiftRows(this.rows.slice(i), this.rows[i].getOverlap(item, true));
    }
  }

  editItem(item, newLayout) {
    this.removeItem(item);
    this.addItem(Object.assign(item, newLayout));
  }

  removeItem(item) {
    const row = item.row;
    row.removeItem(item);

    // Remove row if empty
    if (row.items.length === 0) {
      this.rows.splice(this.rows.indexOf(row), 1);
    }
  }

  shiftRows(rows, diff) {
    rows.forEach(row => row.setTop(row.top + diff));
  }

  removeGaps() {
    if (this.rows.length === 0) {
      return;
    }

    if (this.rows[0].top !== 0) {
      this.shiftRows(this.rows, -this.rows[0].top);
    }

    let maxTop = 0;

    for (let i = 1; i < this.rows.length; i++) {
      maxTop = Math.max(maxTop, this.rows[i - 1].top + this.rows[i - 1].getHeight());
      const gap = this.rows[i].top - maxTop;

      if (gap > 0) {
        this.shiftRows(this.rows.slice(i), -gap);
      }
    }
  }

  getMaxHeight() {
    return this.rows.reduce((sum, row) => {
      return Math.max.apply(undefined, [sum].concat(row.items.map(item => item.top + item.height)));
    }, 0);
  }
}
