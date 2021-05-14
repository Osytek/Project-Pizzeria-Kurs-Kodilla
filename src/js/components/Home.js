/* global Flickity */
/* eslint-disable no-unused-vars */

class Home{
    constructor(){
        const thisHome = this;
        thisHome.initWidgets();
    }

    initWidgets(){
        var elem = document.querySelector('.main-carousel');
var flkty = new Flickity( elem, {
  // options
  cellAlign: 'left',
  contain: true,
  autoPlay: 3000
});
    }
}
export default Home;