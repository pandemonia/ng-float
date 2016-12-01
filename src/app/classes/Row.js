export default class Row {
  constructor(items, top) {
    this.top = top;

    this.items = items;
    items.forEach(item => item.row = this);
  }

  addItem(item) {
    this.items.push(item);
    item.row = this;
  }

  setTop(top) {
    this.top = top;
    this.items.forEach(item => item.top = this.top);
  }

  getTopOverlap(other) {
    let overlap = 0;

    this.items.forEach(item => {
      if (item.doesOverlap(other)) {
        overlap = Math.max(overlap, other.top + other.height - item.top);
      }
    });

    return overlap;
  }
}
