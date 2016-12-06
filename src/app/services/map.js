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
      left: this._closest(left/this.colWidth, Math.floor(left/this.colWidth), Math.ceil(left/this.colWidth)),
      top: this._closest(top/this.rowHeight, Math.floor(top/this.rowHeight), Math.ceil(top/this.rowHeight))
    };
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

  _closest(val, option1, option2) {
    return val - option1 > option2 - val? option2 : option1;
  }
}
