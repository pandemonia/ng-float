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

  px2pos({left, top}) {
    return {
      left: this._closestMultiple(left, this.colWidth),
      top: this._closestMultiple(top, this.rowHeight)
    };
  }

  px2layout({left, top, width, height}) {
    return Object.assign(this.px2pos({left, top}), this.checkMinimum({
      width: this._closestMultiple(width + this.buffer, this.colWidth),
      height: this._closestMultiple(height + this.buffer, this.rowHeight),
    }));
  }

  pos2px({left, top}) {
    return {
      left: left * this.colWidth,
      top: top * this.rowHeight
    };
  }

  layout2px({left, top, width, height}) {
    return Object.assign(this.pos2px({left, top}), {
      width: width * this.colWidth - this.buffer,
      height: this.height2px(height)
    });
  }

  height2px(height) {
    return height * this.rowHeight -  this.buffer;
  }

  checkMinimum({width, height}) {
    return {
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
