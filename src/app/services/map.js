export default class mapService {
  constructor(width = 768, numColumns = 30, buffer = 4) {
    this.width = width;
    this.numColumns = numColumns;
    this.buffer = buffer;

    // colWidth and rowHeight include buffer
    this.colWidth = (this.width - (numColumns - 1) * buffer)/numColumns + buffer;
    this.rowHeight = this.colWidth;
  }

  px2pos({left, top}) {
    return {
      left: this._closestMultiple(left, this.colWidth),
      top: this._closestMultiple(top, this.rowHeight)
    };
  }

  px2layout({left, top, width, height}) {
    return Object.assign(this.px2pos({left, top}), {
      width: this._closestMultiple(width + this.buffer, this.colWidth),
      height: this._closestMultiple(height + this.buffer, this.rowHeight),
    });
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
      height: height * this.rowHeight -  this.buffer
    });
  }

  _closestMultiple(val, divisor) {
    const result = val/divisor;
    const option1 = Math.floor(result);
    const option2 = Math.ceil(result);
    return result - option1 > option2 - result? option2 : option1;
  }
}
