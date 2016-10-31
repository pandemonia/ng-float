export default function () {
  return {
    restrict: 'A',
    controller: function () {
      let items = [];

      this.addItem = item => {
        item.id = items.length;
        items.push(item);

        item.position();
      };

      this.onItemMove = () => {
        orderItemsByTopPosition();

        items.forEach(item => item.position());
      };

      /**
       * First order the items by the top offset. Then compare each element of
       * this ordered list with the previous items and if it overlaps with any
       * of them then set its top offset to be equal to the first item's bottom
       * offset
       */
      function orderItemsByTopPosition() {
        const topPositions = items.slice()
          .sort((a, b) => a.layout.top - b.layout.top)
          .map(item => item.id);

        for (let i = 1; i < topPositions.length; i++) {
          let adj = items[topPositions[i]]; // The item being adjusted

          for (let j = 0; j < i; j++) {
            let ref = items[topPositions[j]]; // The item being compared to

            if (adj.doesOverlap(ref)) {
              adj.layout.top = ref.layout.top + ref.layout.height;
            }
          }
        }
      }
    }
  };
};
