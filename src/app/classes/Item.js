export default class Item {
  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.row = null;
  }

  /**
   * If one or more expressions in the parentheses are true, there's 
   * no overlapping. If all are false, there must be an overlapping.
   */
  doesOverlap(item) {
    return !(this.left + this.width < item.left || item.left + item.width < this.left ||
             this.top + this.height < item.top || item.top + item.height < this.top);
  }
}
