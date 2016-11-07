export default function () {
  return {
    restrict: 'A',
    controller: function ($element) {
      let items = {};

      this.addItem = item => {
        items[Object.keys(items).length] = item;
        position();
        Object.values(items).forEach(item => item.position());
      };

      this.onItemMove = () => {
        position();
        Object.values(items).forEach(item => item.position());
      };

      /**
       * First order the items by the top offset. Then compare each element of
       * this ordered list with the previous items and if it overlaps with any
       * of them then set its top offset to be equal to the first item's bottom
       * offset
       */
      function position() {
        const start = performance.now();

        // Hash map of items by their top positions
        const topHashMap = {};
        Object.keys(items).forEach(id => {
          const item = items[id];
          if (!(item.layout.top in topHashMap)) {
            topHashMap[item.layout.top] = [];
          }
          topHashMap[item.layout.top].push(id);
        });

        // Convert this to an sorted array of objects, each with top and height
        const rows = Object.keys(topHashMap).map(Number).sort().map(key => ({
          top: key,
          items: topHashMap[key],
          height: topHashMap[key].map(id => items[id].layout.height).reduce((a, b) => Math.max(a, b))
        }));

        // Eliminate any space between the rows
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (i === 0) {
            row.top = 0;
          } else {
            row.top = rows[i - 1].top + rows[i - 1].height;
          }
          row.items.forEach(id => {
           items[id].layout.top = row.top;
          });

          if (i === rows.length - 1) {
            $element.css('min-height', (row.top + row.height) + 'px');
          }
        };


        console.debug('flContainer.position', performance.now() - start);
      }
    }
  };
};
