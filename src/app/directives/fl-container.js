/**
 * TODO:
 * Row wise collision detection and sorting
 * Snap to grid - row wise
 */
export default function (positionService) {
  return {
    restrict: 'A',
    controller: function ($element, $timeout) {
      // Items are just a collection. Order has no significance here
      let items = [];

      this.addItem = item => {
        items.push(item);
      };

      // After all the items are added position them
      this.$postLink = function () {
        $timeout(position, 0, false);
      };

      this.onItemMove = () => {
        position();
      };

      /**
       * First order the items by the top offset. Then compare each element of
       * this ordered list with the previous items and if it overlaps with any
       * of them then set its top offset to be equal to the first item's bottom
       * offset
       */
      function position() {
        return positionService.position(items);


        // Convert this to an sorted array of objects, each with top and height
        console.debug(_clone(rows));

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          console.debug(row);
          row.items.sort((a, b) => a.layout.left - b.layout.left);

          const overflow = [];
          for (let j = 1; j < row.items.length;) {
            const cur = row.items[j], prev = row.items[j - 1];
            console.debug(cur, prev);
            if (cur.left < prev.left + prev.width) { // If overlap
              if (prev.left + prev.width + cur.width > container.width()) {
                overflow.push(row.items.splice(j, 0)[0]);
              } else {
                cur.left = prev.left + prev.width;
                j++;
              }
            }
          }

          if (overflow.length > 0) {
            rows.push({
              top: row.top + row.items.reduce((a, b) => Math.max(a.layout.height, b.layout.height)),
              items: overflow
            });
          }
        }

        // Set height for each row
        rows.forEach(row => {
          row.height = row.items.map(item => item.layout.height).reduce((a, b) => Math.max(a, b));
        });

        // Sort by top position
        rows.sort((a, b) => a.top - b.top);

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

        // Position all the items
        Object.values(items).forEach(item => item.position());

      }

    }
  };
};
