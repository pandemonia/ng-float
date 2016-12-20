 class Mapper {
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

  px2layout({left, top, width, height}) {
    return this.checkConstraints({
      left: this._closestMultiple(left, this.colWidth),
      top: this._closestMultiple(top, this.rowHeight),
      width: Math.ceil((width + this.buffer)/this.colWidth),
      height: Math.ceil((height + this.buffer)/this.rowHeight),
    });
  }

  layout2px({left, top, width, height}) {
    return {
      left: left * this.colWidth,
      top: top * this.rowHeight,
      width: width * this.colWidth - this.buffer,
      height: this.height2px(height)
    };
  }

  height2px(height) {
    return height * this.rowHeight -  this.buffer;
  }

  checkConstraints({width, height, left, top}) {
    return {
      left,
      top,
      width: Math.max(this.minWidth, width),
      height: Math.max(this.minHeight, height)
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
