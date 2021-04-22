import {select, settings, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';



class Cart{
    constructor(element){
      const thisCart = this;
  
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      
      
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }
    add(menuProduct){
      const thisCart = this;
      

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);
      
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
      
    }
    initActions(){
      const thisCart = this;
      
  

      /* START: add event listener to clickable trigger on event click */
      thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
      
        /* toggle active class on thisProduct.element */
        thisCart.dom.wrapper.classList.toggle('active');
      }); 
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []
      };
      
      for(let prod of thisCart.products) {
       payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
      
    }

    remove(){
      const thisCart = this;
      const cartDiv = document.querySelector('.cart__order-summary li');
      cartDiv.remove();

      thisCart.products.splice(cartDiv, 1);
      
    
      thisCart.update();

    
      
    
    }
    update() {
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      if (thisCart.totalNumber == 0 ) {
        thisCart.deliveryFee == 0;
      }
      
 
      for (let element of thisCart.products) {
        thisCart.totalNumber += element.amount;
        thisCart.subtotalPrice += element.price;
      }
      
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      
      const total = document.querySelector('.cart__order-total .cart__order-price-sum strong');

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      total.innerHTML = thisCart.totalPrice;
 
      console.log('TotalNumber', thisCart.totalNumber);
      console.log('TotalSubtotalPrice', thisCart.subtotalPrice);
      console.log('TotalPrice', thisCart.totalPrice);
    }
  }
export default Cart;