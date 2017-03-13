var App = {

    namespace: function (name) {

        var parts = name.split('.');
        var ns = this;

        for (var i = 0, len = parts.length; i < len; i++) {

            ns[parts[i]] = ns[parts[i]] || {};
            ns = ns[parts[i]];
        }

        return ns;
    },
};

App.namespace('Utils').DOM = (function() {

    /**
     * A shorthand for the document.querySelector method
     * @param  {String}  selector A valid CSS selector
     * @param  {Node}    context An optional context element
     * @return {Node}    An HTML node element
     */

    var $ = function( selector, context ) {
        return ( context || document ).querySelector( selector );
    };

    /**
     * A shorthand for the document.querySelectorAll method
     * @param  {String}  selector A valid CSS selector
     * @param  {Node}    context An optional context element
     * @return {Node}    An HTML node list
     */

    var $$ = function( selector, context ) {
        return ( context || document ).querySelectorAll( selector );
    };

    /**
     * A shorthand for the document.getElementById method
     * @param  {String}  selector A valid CSS selector
     * @param  {Node}    context An optional context element
     * @return {Node}    An HTML node element
     */

    var id = function( selector, context ) {
        return ( context || document ).getElementById( selector );
    };

    /**
     * Remove a number of elements from the page entirely
     * @param  {NodeList} nodeList A list of nodes
     * @return {Array}             An array containing the removed elements
     */
    var removeAll = function( nodeList ) {
        nodeList = nodeList || [];

        nodeList.forEach( function( element ) {
            element.parentNode.removeChild( element );
        });

        return [].slice.call(nodeList);
    };

    /**
     * Remove a number of elements from the page entirely
     * @param  {String} selector A valid CSS selector
     * @return {Array}           An array containing the removed elements
     */
    var removeAllBySelector = function( selector ) {
        return removeAll( $$(selector) );
    };

    /**
     * Swap the position of two DOM elements
     * @param  {Node}  nodeA The first node
     * @param  {Node}  nodeB The second node
     * @return {Boolean}  It returns true if the swap was successful
     *                    and false otherwise
     */
    var swapElements = function(nodeA, nodeB) {
        var parentA = nodeA.parentNode;
        var parentB = nodeB.parentNode;
        var success = null;

        try {
            parentA.replaceChild(nodeB.cloneNode(true), nodeA);
            parentB.replaceChild(nodeA.cloneNode(true), nodeB);
            success = true;
        } catch (e) {
            success = false;
        }

        return success;
    };

    /**
     * Insert a new node after an existing node in the DOM
     * @param  {Node}  newNode The element you wish to insert
     * @param  {Node}  refNode The existing node in the DOM
     * @return {Node}  The element that was inserted
     */
    var insertAfter = function(newNode, refNode) {
        return refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    };


    /**
     * A shorthand for the innerHTML method
     * @param  {Node}  target An HTML node
     * @param  {Value} value  An value in HTML format
     */

    var innerH = function( target, value ) {
        target.innerHTML = value;
    };

    return {
        $: $,
        $$: $$,
        id: id,
        removeAll: removeAll,
        removeAllBySelector: removeAllBySelector,
        swapElements: swapElements,
        insertAfter: insertAfter,
        innerH: innerH
    };
})();

App.namespace('Utils').Math = (function() {

    /**
     * Get a random integer
     * @param  {Number} max  The upper limit
     * @return {Number}      A random integer from 0 to max
     */

    var getRandom = function(max) {
        return parseInt(Math.random() * max, 10);
    };

    return {
        getRandom: getRandom
    };
})();

App.namespace('Utils').Array = (function() {

    var _math = App.Utils.Math;

    /**
     * Return the index of an element or -1
     * @param  {Array}  haystack  An array
     * @return {Value}  needle    The element of the array
     * @return {Integer}  The index of an element (if present) or -1
     */

    var indexOf = function (haystack, needle) {

        var i      = 0;
        var length = haystack.length;
        var found  = false;
        var idx    = -1;

        if ( typeof Array.prototype.indexOf === 'function' ) {
            return haystack.indexOf(needle);
        }

        while ( i < length && !found ) {
            if ( haystack[i] === needle ) {
                idx = i;
                found = true;
            }

            i++;
        }

        return idx;
    };

    /**
     * Shuffle an array
     * @param  {Array}  array An array to shuffle
     * @return {Array}        A shuffled array
     */

    var shuffle = function(array) {
        var result = [];
        var len = array.length;
        var rnd;

        while (len) {
            rnd = _math.getRandom(array.length);
            if (rnd in array) {
                result.push(array[rnd]);
                delete array[rnd];
                len--;
            }
        }

        return result;
    };

    /**
     * Convert an Object List into an Array
     * @param  {Object} list An Object list
     * @return {Array}
     */

    var toArr = function ( list ) {
        return [].slice.call( list );
    };

    return {
        indexOf: indexOf,
        shuffle: shuffle,
        toArr: toArr
    };
})();

App.namespace('Utils').Obj = (function() {

    /**
     * Check if the provided element is of type 'type'
     * @param  {Object}  el   An Object
     * @param  {String}  type A data type
     * @return {Boolean}
     */

    var isOfType = function( el, type ) {

        var objType;

        type    = (type || '').trim().toLowerCase();
        objType = Object.prototype.toString.call(el).toLowerCase();

        return objType === '[object '+ type +']';
    };

    // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    var extend = function() {

        var extended = {};
        var toString = toString;
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( isOfType( arguments[0], 'Boolean' ) ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && isOfType( obj[prop], 'Object' ) ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };

    /**
     * Generate random GUIDs
     * @return {Value}
     */

    var guid = function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return {
        extend: extend,
        guid: guid
    };
})();

App.namespace('Utils').Events = (function() {

    var EventEmitter = function () {
        this.events = {};
    };

    EventEmitter.prototype.on = function( event, listener ) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    };

    EventEmitter.prototype.removeListener = function( event, listener ) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = App.Utils.Array.indexOf( this.events[event], listener );

            if ( idx > -1 ) {
                this.events[event].splice( idx, 1 );
            }
        }
    };

    EventEmitter.prototype.emit = function( event ) {
        var args = [].slice.call( arguments, 1 );
        var i;
        var listeners;
        var length;

        if ( typeof this.events[event] === 'object' ) {
            listeners = this.events[event].slice();
            length    = listeners.length;

            for ( i = 0; i < length; i++ ) {
                listeners[i].apply( this, args );
            }
        }
    };

    EventEmitter.prototype.once = function( event, listener ) {
        this.on( event, function g () {
            this.removeListener( event, g );
            listener.apply( this, arguments );
        });
    };

    /**
     * AddEventListener Wrapper
     */

    var $on = function( target, type, callback, useCapture ) {
        target.addEventListener(type, callback, !!useCapture);
    };

    /***************************************************************************
     *                  CSS Animation Events with JavaScript
     ***************************************************************************
     *
     * animationstart     - listener function fires as soon as the animation
     *                      begins
     *
     * animationiteration - listener function fires at the beginning of every
     *                      subsequent animation iteration
     *
     * animationend       - listener function fires at the end of the animation
     *
     *
     *  all browsers have their prefixes
     *
     * No prefix - animationstart, animationiteration, animationend
     * Webkit    - webkitAnimationStart, webkitAnimationIteration, webkitAnimationEnd
     * Mozilla   - mozAnimationStart, mozAnimationIteration, mozAnimationEnd
     * MS        - MSAnimationStart, MSAnimationIteration, MSAnimationEnd
     * O         – oAnimationStart, oAnimationIteration, oAnimationEnd
     */

    var pfx = ['webkit', 'moz', 'MS', 'o', ''];

    var $prefixedOn = function ( target, type, callback, useCapture ) {

        for ( var p = 0, length = pfx.length; p < length; p++ ) {
            if ( !pfx[p] ) {
                type = type.toLowerCase();
            }
            target.addEventListener( pfx[p]+type, callback, !!useCapture );
        }
    };

    return {
        Emitter: EventEmitter,
        $on: $on,
        $prefixedOn: $prefixedOn
    };
})();

App.namespace('DateTime').Timer = (function(window) {

    function Timer( time, step ) {
        this.isStarted   = false;
        this.paused      = true;
        this.timerId     = null;
        this.time        = Math.floor(time);
        this.ID          = App.Utils.Obj.guid();
        this.step        = step || 1;
        this.initialTime = this.getCurrentTime();
    }

    Timer.prototype = new App.Utils.Events.Emitter();
    Timer.prototype.constructor = Timer;

    Timer.prototype.getHours = function() {
        return Math.floor( this.time / 3600 );
    };

    Timer.prototype.getMinutes = function( doubleZero ) {

        var h = this.getHours();
        var m = Math.floor(( this.time - ( h * 3600 )) / 60 );

        if ( !!doubleZero && m < 10 ) {
            m = '0' + m;
        }

        return m;
    };

    Timer.prototype.getSeconds = function( doubleZero ) {

        var h = this.getHours();
        var m = this.getMinutes(true);
        var s = this.time - ( h * 3600 ) - ( m * 60 );

        if ( !!doubleZero && s < 10 ) {
            s = '0' + s;
        }

        return s;
    };

    Timer.prototype.getCurrentTime = function() {

        var h = this.getHours();
        var m = this.getMinutes(true);
        var s = this.getSeconds(true);

        return h + ':' + m + ':' + s;
    };

    Timer.prototype.getInitialTime = function() {
        return this.initialTime;
    };

    Timer.prototype.setTime = function( time, step ) {
        // Prevent from changing a running timer
        if ( !this.isStarted ) {
            return;
        }

        this.time = Math.floor(time);
        this.step = step || 1;
    };

    Timer.prototype.count = function() {

        var h = this.getHours();
        var m = this.getMinutes(true);
        var s = this.getSeconds(true);
        var c = this.getCurrentTime();

        this.emit( this.ID + '-tick', c, h, m, s );

        this.time -= this.step;

        if ( this.time < 0 ) {
            window.clearInterval( this.timerId );
            this.emit( this.ID + '-elapsedTime' );
        }
    };

    Timer.prototype.start = function() {
        this.isStarted = true;
        this.resume();
    };

    Timer.prototype.resume = function() {

        var self = this;

        if ( this.paused && this.time > 0 ) {
            this.timerId = window.setInterval( self.count.bind(self),
                                               self.step * 1000 );
            this.paused = false;
        }
    };

    Timer.prototype.pause = function() {
        this.paused = true;
        window.clearInterval( this.timerId );
    };

    Timer.prototype.isPaused = function() {
        return this.paused;
    };

    return Timer;
})(window);