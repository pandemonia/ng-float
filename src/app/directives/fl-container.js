export default function () {
  return {
    restrict: 'A',
    controller: function () {
      this.items = [];
      this.addItem = item => {
        console.debug(item);
        item.id = this.items.length;
        this.items.push(item);
        item.position();
      };

      this.onItemMove = () => {

        //order by top position
        this.items.forEach(item => {

        });
        this.items.forEach(item => item.position());
      };
    }
  };
};
