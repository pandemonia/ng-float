export class Item {
  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.row = null;
  }

  doesOverlap(item) {
    return !(this.left + this.width <= item.left || item.left + item.width <= this.left ||
             this.top + this.height <= item.top || item.top + item.height <= this.top);
  }
}
