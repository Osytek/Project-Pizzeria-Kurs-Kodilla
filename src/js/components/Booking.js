import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidgets.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
// Global

const filters = [];

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.reservation = [];
        thisBooking.bookings = {};
        
        
        
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();

        
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

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.tableContainer = thisBooking.dom.wrapper.querySelector(select.containerOf.booking);

        thisBooking.dom.inputAddress = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.inputPhone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
        
        
    }
    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){

        });
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
            const activeTables = document.querySelectorAll('.selected');
            for(let activeTable of activeTables){
                activeTable.classList.remove('selected');
            }
        });
        
       
        for(let table of thisBooking.dom.tables){
            
            table.addEventListener('click', function(event){
                const activeTables = document.querySelectorAll('.selected');
                

                if(!event.target.classList.contains('booked') && !table.classList.contains('selected')){

                    table.classList.add('selected');

                    const tableId = table.getAttribute('data-table');

                    thisBooking.reservation.push(tableId);

                }else if(!event.target.classList.contains('booked') && table.classList.contains('selected')){
                    
                    table.classList.remove('selected');
                }
                else if(event.target.classList.contains('booked')){
                    alert('We are sorry, but this table is reserved');
                }
                for(let activeTable of activeTables){
                    activeTable.classList.remove('selected');
                }
            });
        }
       
        thisBooking.filtersForm =  document.querySelectorAll('.checkbox');
        for(let filterForm of thisBooking.filtersForm){
            filterForm.addEventListener('click', function(event){
                    if(event.target.checked){
                        filters.push(event.target.value);
                    }
                    else{
                        filters.splice(filters.indexOf(event.target.value));
                    }
            });

        }
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.booking-form');
        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
          });
    }
    


    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {          
            booking:[
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        const urls = {
            booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),

        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function(allResponse){
                const bookingsResponse = allResponse[0];
                const eventsCurrentResponse = allResponse[1];
                const eventsRepeatResponse = allResponse[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function([bookings, eventsCurrent, eventsRepeat]){
               // console.log(bookings);
               // console.log(eventsCurrent);
               // console.log(eventsRepeat);
               thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour =  utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }

        thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvaidable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvaidable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(
                !allAvaidable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else{
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }
    sendBooking() {
        const thisBooking = this;
     
        const url = settings.db.url + '/' + settings.db.booking;
     
        const payload = {
          date: thisBooking.date,
          hour: thisBooking.hourPicker.value,
          table: [],
          ppl: thisBooking.peopleAmount.value,
          duration: thisBooking.hoursAmount.value,
          starters: [],
          address: thisBooking.dom.inputAddress.value,
          phone: thisBooking.dom.inputPhone.value,
        };
     
        for (let starter of thisBooking.dom.starters) {
          if (starter.checked == true) {
            payload.starters.push(starter.value);
          }
        }
     
        for (let table of thisBooking.dom.tables) {
     
          const tableNumber = table.getAttribute(settings.booking.tableIdAttribute);
          const tableId = parseInt(tableNumber);
     
          if (table.classList.contains('selected')) {
            payload.table.push(tableId);
            table.classList.replace('selected', 'booked');
          }
        }
     
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };
     
        fetch(url, options)
          .then(function (response) {
            return response.json();
          })
          .then(function (parsedResponse) {
            console.log('parsedResponse', parsedResponse);
          });
      }
}
export default Booking;