 class Mapper {
  constructor({width = 768, rowHeight = 15, numColumns = 60, buffer = 4, minHeight = 4, minWidth = 10, dragBuffer = 5}) {
    this.width = width;
    this.numColumns = numColumns;
    this.buffer = buffer;
    this.rowHeight = rowHeight;
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.dragBuffer = dragBuffer;

    // colWidth and rowHeight include buffer
    this.colWidth = (width - (numColumns - 1) * buffer)/numColumns + buffer;
  }

  /** All sides (left, right, top, bottom) are snapped to a grid */
  px2layout(pixels) {
    const left = this._closestMultiple(pixels.left, this.colWidth);
    const top = this._closestMultiple(pixels.top, this.rowHeight);
    const right = this._closestMultiple(this.left2px(left) + pixels.width, this.colWidth);
    const bottom = this._closestMultiple(this.top2px(top) + pixels.height, this.rowHeight);

    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  }

  layout2px({left, top, width, height}) {
    return {
      left: this.left2px(left),
      top: this.top2px(top),
      width: this.width2px(width),
      height: this.height2px(height)
    };
  }

  left2px(left) {
    return left * this.colWidth;
  }

  top2px(top) {
    return top * this.rowHeight;
  }

  width2px(width) {
    return width * this.colWidth - this.buffer;
  }

  height2px(height) {
    return height * this.rowHeight -  this.buffer;
  }

  getClosestPosition(pixels) {
    return this.checkPositionConstraints(this.px2layout(pixels));
  }

  getClosestSize(pixels, axis) {
    return this.checkSizeConstraints(this.px2layout(pixels), axis);
  }

  checkPositionConstraints({width, height, left, top}) {
    // Right container
    if (left + width > this.numColumns) {
      left = this.numColumns - width;
    }

    // Left container
    if (left < 0) {
      left = 0;
    }

    // Top container
    if (top < 0) {
      top = 0;
    }

    return {
      left,
      top,
      width,
      height
    };
  }

  checkSizeConstraints({width, height, left, top}, isLeft) {
    // Right container
    if (left + width > this.numColumns) {
      width = this.numColumns - left;
    }

    if (left < 0) {
      const right = left + width;
      left = 0;
      width = right - left;
    }

    if (width < this.minWidth) {
      // If it was shrunk from the left handler, then move the leftside back
      if (isLeft) {
        left -= this.minWidth - width;
      }
      width = this.minWidth;
    }

    if (height < this.minHeight) {
      height = this.minHeight;
    }

    return {
      left, top, width, height
    };
  }

  _closestMultiple(val, divisor) {
    const result = val/divisor;
    const option1 = Math.floor(result);
    const option2 = Math.ceil(result);
    return result - option1 > option2 - result? option2 : option1;
  }
}

export default function MapperFactory() {
  return Mapper;
}
