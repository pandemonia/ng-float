export class Mapper {
  constructor({width = 768, rowHeight = 15, numColumns = 60, buffer = 4, minHeight = 4, minWidth = 10}) {
    this.width = width;
    this.numColumns = numColumns;
    this.buffer = buffer;
    this.rowHeight = rowHeight;
    this.minHeight = minHeight;
    this.minWidth = minWidth;

    // colWidth and rowHeight include buffer
    this.colWidth = (width - (numColumns - 1) * buffer)/numColumns + buffer;
  }

  /** All sides (left, right, top, bottom) are snapped to a grid */
  px2layout({left, top, width, height}) {
    const pos = this.px2pos({left, top});
    const right = Math.ceil((this.left2px(pos.left) + width)/this.colWidth);
    const bottom = Math.ceil((this.top2px(pos.top) + height + this.buffer)/this.rowHeight);

    return {
      left: pos.left,
      top: pos.top,
      width: right - pos.left,
      height: bottom - pos.top,
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

  px2pos({left, top}) {
    return {
      left: this._closestMultiple(left, this.colWidth),
      top: this._closestMultiple(top, this.rowHeight)
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

  px2dimension({left, top, height, width}) {
    if(typeof left === "string" && left.includes('px')) {
      left = this._closestMultiple(parseInt(left), this.colWidth);
    }

    if(typeof top === "string" && top.includes('px')) {
      top = this._closestMultiple(parseInt(top), this.rowHeight);
    }

    if(typeof height === "string" && height.includes('px')) {
      height = this._closestMultiple(parseInt(height), this.rowHeight);
    }

    if(typeof width === "string" && width.includes('px')) {
      width = this._closestMultiple(parseInt(width), this.colWidth);
    }

    return {left,top,height,width};
  }

  _closestMultiple(val, divisor) {
    const result = val/divisor;
    const option1 = Math.floor(result);
    const option2 = Math.ceil(result);
    return result - option1 > option2 - result? option2 : option1;
  }
}

export function MapperService() {
  return Mapper;
}
