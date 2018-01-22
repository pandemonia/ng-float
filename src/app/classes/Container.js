import Row from './Row'

export default class Container {
  constructor(items = []) {
    let status;
    do {
      items.sort((a, b) => a.top - b.top);
      items.sort((a, b) => a.left - b.left);
      status = this.positionItems(items);
    } while (status);
    this.rows = this.itemsToRows(items);
  }

  positionItems(items) {
    let isChange = false;
    for (var i=0; i<items.length; i++) {
      for (var j=i+1; j<items.length; j++) {
        if (items[i].doesOverlap(items[j])) {
          if (items[i].top <= items[j].top) {
            items[j].top = items[i].top + items[i].height;
          } else if (items[i].top > items[j].top) {
            items[i].top = items[j].top + items[j].height;
          }
          isChange = true;
        }
      }
    }
    return isChange;
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

  getClosestTop(layout) {
    if (this.rows.length === 0) {
      layout.top = 0;
    } else {
      for (let i = this.rows.length - 1; i >= 0; i--) {
        if (this.rows[i].top < layout.top) {
          layout.top = this.rows[i].top;
          layout.top += this.rows[i].getOverlap(layout, false);
          break;
        }
      }
    }

    return layout;
  }

  getWidthAtPos({left, top}) {
    let leftSide = 0, rightSide = Infinity;

    this.rows.forEach(row => {
      if (row.top >= top) {
        return false;
      }

      row.items.forEach(item => {
        if (item.top + item.height > top) {
          if (item.left < left) {
            leftSide = Math.max(leftSide, item.left + item.width);
          } else {
            rightSide = Math.min(rightSide, item.left);
          }
        }
      });
    });

    return {
      left: leftSide,
      width: rightSide - leftSide
    };
  }
}
