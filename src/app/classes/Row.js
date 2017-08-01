export default class Row {
  constructor(items, top) {
    this.top = top

    this.items = items
    items.forEach(item => item.row = this)
  }

  addItem(item) {
    this.items.push(item)
    item.row = this
  }

  removeItem(item) {
    const index = this.items.indexOf(item)
    item.row = null
    this.items.splice(index, 1)
  }

  setTop(top) {
    this.top = top
    this.items.forEach(item => item.top = this.top)
  }

  getHeight() {
    return this.items.reduce((max, item) => {
      return Math.max(max, item.height)
    }, 0)
  }

  getOverlap(other, otherOnTop) {
    let overlap = 0

    this.items.forEach(item => {
      if (item.doesOverlap(other)) {
        if (otherOnTop) {
          overlap = Math.max(overlap, other.top + other.height - item.top)
        } else {
          overlap = Math.max(overlap, item.top + item.height - other.top)
        }
      }
    })

    return overlap
  }
}
