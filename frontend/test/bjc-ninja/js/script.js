/**
 * @copyright Copyright (c) 2013. All rights reserved.
 * @author Yuriy Sinyaev <meefox@gmail.com>
 * @version 1.0
 **/
(function(){
    'use strict';

    //Safe is shim used for backward compatibility with old IE7,8
    var safe = {
        addEventListener: function(elem, event, callback){
            if(document.addEventListener) {
                //modern
                elem.addEventListener(event, callback, false);
            } else {
                //lte IE8
                elem.attachEvent('on' + event, callback);
            }
        },
        removeEventListener: function(elem, event, callback){
            if(document.addEventListener) {
                //modern
                elem.removeEventListener(event, callback, false);
            } else {
                //lte IE8
                elem.detachEvent('on' + event, callback);
            }
        },
        eventTarget: function(event){
            return event.target ? event.target : event.srcElement;
        },
        preventDefault: function(event){
            if(event.preventDefault){
                //modern
                event.preventDefault();
            } else {
                //lte IE8
                event.returnValue = false;
            }
        },
        getElementsByClassName: function(elem, className) {
            if(document.getElementsByClassName){
                //modern
                return elem.getElementsByClassName(className);
            } else {
                //lte IE8
                var result = [],
                    regExp = new RegExp('(^| )' + className + '( |$)'),
                    elemAll = elem.getElementsByTagName('*'),
                    elemAllLength = elemAll.length;

                for(var i = 0, j = elemAllLength; i < j; i++){
                    if(regExp.test(elemAll[i].className))
                        result.push(elemAll[i]);
                }

                return result;
            }
        }
    };

    //Bind for lte IE8
    //Stack Overflow solution
    (function() {
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {

            if(typeof this !== 'function'){
              throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                self = this,
                fNOP = function () {},
                fBound = function () {
                    return self.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
            };
        }
    })();

    function Basket(){}
    Basket.prototype = {
        basketEl: document.getElementById('basketTable'),
        contentEl: document.getElementById('basketContent'),
        subTotalEl: document.getElementById('subTotal'),
        vatEl: document.getElementById('vat'),
        totalEl: document.getElementById('totalCost'),
        sendButtonEl: document.getElementById('sendBasketButton'),
        nameClass: 'item-name',
        priceClass: 'item-price',
        quantityClass: 'item-quantity',
        totalClass: 'item-total',
        listeners: [],

        init: function(){
            var self = this,
                inputsEl = safe.getElementsByClassName(this.contentEl, this.quantityClass),
                inputsElLength = inputsEl.length;

            //Enable inputs for JS enabled version
            for(var i = 0; i < inputsElLength; i++){
                inputsEl[i].disabled = false;
            }

            // Adding event listeners
            safe.addEventListener(this.contentEl, 'click', this.routeEvent.bind(this));
            safe.addEventListener(this.sendButtonEl, 'click', this.sendData.bind(this));
        },
        routeEvent: function(event){
            //In terms of performance for all items used one event listener
            safe.preventDefault(event);

            var self = this,
                elem = safe.eventTarget(event),
                action = elem.getAttribute('data-action');

            if(!action) return;

            //Route event
            if(action === 'increment')
                return self.incrementItem(elem);

            if(action === 'decrement')
                return self.decrementItem(elem);

            if(action === 'remove')
                return self.removeItem(elem);

            if(action === 'editMode')
                return self.editMode(event);
        },
        //Better way to get parent but slower :(
        // getItemRow: function(elem){
        //     if(elem.toUpperCase() === 'TR'){
        //         return elem;
        //     } else if(elem === document.body){
        //         return null;
        //     } else {
        //         return this.getItemRow(elem.parentElement);
        //     }
        // },
        sendData: function(){
            var self = this,
                contentChildrensLength = this.contentEl.children.length,
                items = [];

            //Get cart information
            for(var i = 0; i < contentChildrensLength; i++){
                var parentEl = this.contentEl.children[i],
                    quantityEl = safe.getElementsByClassName(parentEl, this.quantityClass)[0],
                    nameEl = safe.getElementsByClassName(parentEl, this.nameClass)[0],
                    priceEl = safe.getElementsByClassName(parentEl, this.priceClass)[0],
                    quantity = parseInt(quantityEl.value, 10),
                    price = parseFloat(priceEl.innerHTML),
                    item = {
                        itemId: parentEl.getAttribute('data-item-id'),
                        itemName: nameEl.innerHTML,
                        quantity: quantity,
                        price: price,
                        total: (quantity * price)
                    };

                items.push(item);
            }

            if(items.length){
                //aJax request
                var xmlhttp = new XMLHttpRequest();

                //TODO: Add preloader, disable controls

                xmlhttp.onreadystatechange = function(){
                    if (xmlhttp.readyState === 4) {
                        if(xmlhttp.status === 200){
                            //TODO: Remove preloader, enable controls, go next...
                        } else {
                            //TODO: Remove preloader, enable controls, display error
                        }
                    }
                };

                xmlhttp.open('POST', 'http://ju-vision.com', true);
                xmlhttp.setRequestHeader('Content-type', "application/json;charset=UTF-8");
                //FIXME: JSON.stringify doesn't work in IE7!
                xmlhttp.send(JSON.stringify(items));

                alert(JSON.stringify(items));
            }
        },
        disableCheckout: function(){
            this.sendButtonEl.className += ' disabled';

            safe.removeEventListener(this.contentEl, 'click', this.routeEvent.bind(this));
            safe.removeEventListener(this.sendButtonEl, 'click', this.sendData.bind(this));

            this.basketEl.parentNode.removeChild(this.basketEl);
        },
        incrementItem: function(elem){
            //Plus one, limited to 10 on purpose
            var inputEl = elem.parentNode.getElementsByTagName('input')[0],
                value = parseInt(inputEl.value, 10);

            inputEl.value = value < 10 ? value + 1 : 10;
            this.calculationItem(inputEl);
        },
        decrementItem: function(elem){
            //Minus one, limited to 1 on purpose
            var inputEl = elem.parentNode.getElementsByTagName('input')[0],
                value = parseInt(inputEl.value, 10);

            inputEl.value = value > 1 ? value - 1 : 1;
            this.calculationItem(inputEl);
        },
        removeItem: function(elem){
            var el = elem.parentElement.parentElement;
            el.parentNode.removeChild(el);
            this.calculationTotal();
        },
        calculationItem: function(inputEl){
            //Calculation on row item
            var rowEl = inputEl.parentElement.parentElement.parentElement, //<- this.getItemRow(inputEl) could be here
                totalEl = safe.getElementsByClassName(rowEl, this.totalClass)[0],
                quantity = parseFloat(inputEl.value),
                price = parseFloat(safe.getElementsByClassName(rowEl, this.priceClass)[0].innerHTML);

            totalEl.innerHTML = (quantity * price).toFixed(2).toString();

            this.calculationTotal();
        },
        calculationTotal: function(){
            //Calculation of total
            var total = 0,
                contentElChildLength = this.contentEl.children.length;

            if(contentElChildLength === 0)
                return this.disableCheckout();

            for(var i = 0; i < contentElChildLength; i++){
                var totalEl = safe.getElementsByClassName(this.contentEl.children[i], this.totalClass)[0];
                total += parseFloat(totalEl.innerHTML);
            }

            this.subTotalEl.innerHTML = total.toFixed(2).toString();
            this.vatEl.innerHTML = this.calcVAT(total).toString();
            this.totalEl.innerHTML = this.calcTotalWithVAT(total).toString();
        },
        calcVAT: function(total){
            return (total * 0.2).toFixed(2);
        },
        calcTotalWithVAT: function(total){
            return (total * 1.2).toFixed(2);
        },
        editMode: function(event){
            //On focus input
            var self = this,
                elem = safe.eventTarget(event),
                listenersLength = self.listeners.length;

            for(var i = 0; i < listenersLength; i++){

                if(self.listeners[i].name === elem){
                    return;
                }
            }
            safe.addEventListener(elem, 'keyup', self.validate.bind(self));
            safe.addEventListener(elem, 'blur', self.releaseEdit.bind(self));
            self.listeners.push({'name': elem});
        },
        releaseEdit: function(event){
            //On blur input
            var self = this,
                elem = safe.eventTarget(event),
                listenersLength = self.listeners.length;

            for(var i = 0; i < listenersLength; i++){

                if(self.listeners[i].name === elem){
                    safe.removeEventListener(elem, 'keyup', self.validate.bind(self));
                    safe.removeEventListener(elem, 'blur', self.releaseEdit.bind(self));
                    self.listeners.splice(i, 1);
                }
            }
        },
        validate: function(event){
            //On keyup, blur
            var elem = safe.eventTarget(event),
                value = parseInt(elem.value, 10),
                regexp = new RegExp(/^([1-9]|10)$/);

            //If zero, increase to minimum one, but it's not necessary I think.
            if(value === 0){
                elem.value = 1;
                return this.calculationItem(elem);
            }

            //If more than 10 we decrease to 10 automaticly
            if(value > 10){
                elem.value = 10;
                return this.calculationItem(elem);
            }

            //For more complex situation
            value = regexp.exec(value);

            if(value !== null){
                elem.value = value[0];
            } else{
                elem.value = 10;
            }

            this.calculationItem(elem);
        }
    };
    var basket = new Basket();
    basket.init();
}());