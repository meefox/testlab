/**
 * @license Copyright (c) 2012. All rights reserved.
 * @author: Yuriy Sinyaev, meefox@gmail.com
 **/

var Muffin = function (){};
Muffin.prototype = {
    setCookie: function(name, value, exp){
        var date = new Date();
        date.setMonth( date.getMonth() + exp );

        document.cookie = name +'=' +escape(value)+'; path=/; expires=' +date.toUTCString();
    },
    getCookie: function(name) {
        var cookie,
            cookies = document.cookie.split(';');

        for(var i = 0; i < cookies.length; i++) {
            cookie = cookies[i].split('=');
            cookie[0] = cookie[0].replace(/ +/g, '');

            if(cookie[0] == name){
                return decodeURIComponent(cookie[1]);
            }
        }
        return false;
    }
};

var cookieEater = new Muffin ();