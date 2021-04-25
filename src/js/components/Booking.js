import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidgets.js';


class Booking{
    constructor(element){
        const thisBooking = this;
        
        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;

        /* generate HTML based on template */
        
        const generatedHTML = templates.bookingWidget(element);

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        
        

        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){

        });
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });
    }
    initWidgets(){

    }
}
export default Booking;