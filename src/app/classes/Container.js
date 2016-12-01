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
    let row = this.rows.find(row => row.top === item.top);
    
    if (!row) {
      row = new Row([item], item.top, this);

      let insertIndex = this.rows.findIndex(row => row.top > item.top);
      if (insertIndex === -1) {
        insertIndex = this.rows.length;
      }

      this.rows.splice(insertIndex, 0, row);
    } else {
      row.addItem(item);  
    }

    this.rows.forEach((row, index) => {
      if (row.top > item.top && row.top < item.top + item.height) {
        const overlap = row.getTopOverlap(item);

        if (overlap) {
          console.debug('overlap', overlap);
          this.shiftRows(this.rows.slice(index), overlap);
        }
      }
    });
  }

  shiftRows(rows, diff) {
    rows.forEach(row => row.setTop(row.top + diff));
  }
}
