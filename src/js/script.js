/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars



{
  
  'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
  
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
};
  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      

      

    }
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
      
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      
    }
    initAccordion(){
      const thisProduct = this;
      
  

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
      event.preventDefault();
        /* find active product (product that has active class) */
      const activeProducts = document.querySelectorAll('.product');
      for(let activeProduct of activeProducts){
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
        }
      }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      }); 
    }
    initOrderForm(){
      const thisProduct = this;
      
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
    
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        

        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
          if(!optionId.default) {
            // add option price to price variable
            price += option.price;
          }
         else {
          // check if the option is default
          if(optionId.default) {
            // add option price to price variable
            price -= option.price;
          }
         }

        }
        const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        
        for(let optionImage of optionImages){
          if(formData[paramId] && formData[paramId].includes(optionId)){
            optionImage.classList.add('active');
          }
          else{ 
            optionImage.classList.remove('active');
          }
        }
      }

      }
    
      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      
      thisProduct.priceElem.innerHTML = price;
      thisProduct.price = price;


    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
      
    }
    prepareCartProduct(){
      const thisProduct = this;
      const productSummary = {
        
        id: thisProduct.id,
        label: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        price: thisProduct.price,
        priceSingle: thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
        
      };
      return productSummary;
      
      
    }
    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
            
          }
          
        }
      }
      
      return params;
      
    }
    
  } 
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value > 0 ? thisWidget.input.value : settings.amountWidget.defaultValue);
      thisWidget.initActions();
      
    }
    getElements(element){
      const thisWidget = this;
      
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      
      if(thisWidget.value !== newValue && !isNaN(newValue)){
        thisWidget.value = newValue;
        thisWidget.input.value = thisWidget.value;
      }if(thisWidget.value < settings.amountWidget.defaultMin){
        thisWidget.value = settings.amountWidget.defaultMin;
        thisWidget.input.value = thisWidget.value;
      }if(thisWidget.value > settings.amountWidget.defaultMax){
        thisWidget.value = settings.amountWidget.defaultMax;
        thisWidget.input.value = thisWidget.value;
      }
      thisWidget.announce();
      
    }
    
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }
    announce(){
      const thisWidget = this;
  
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
    
  }
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
 
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      
 
      console.log('TotalNumber', thisCart.totalNumber);
      console.log('TotalSubtotalPrice', thisCart.subtotalPrice);
      console.log('TotalPrice', thisCart.totalPrice);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.label = menuProduct.label;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
      

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      
    }
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWidget(){
      const thisCartProduct = this;
      

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        
        
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        
        
      });
      
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };


  app.init();

}
