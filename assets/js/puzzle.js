'use strict';

document.addEventListener('DOMContentLoaded', function (e) {

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

        return {
            $: $,
            $$: $$,
            id: id,
            removeAll: removeAll,
            removeAllBySelector: removeAllBySelector,
            swapElements: swapElements
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
        var extend = function () {

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

        return {
            extend: extend
        };
    })();

    function Puzzle( element ) {
        this.element = element;
        this.init();
    }

    Puzzle.prototype = {
        constructor: Puzzle,

        init: function() {
            this.cPieces   = App.Utils.DOM.$( '.c-pieces' );
            this.pieces    = App.Utils.DOM.$$( '.c-pieces__piece' );
            this.draggable = false;
            this.settings  = {
                difficulty: 3,
                time: 60 * 9 * 1000,
            };

            this.handleDrag();
            this.handleDrop();

        },

        start: function() {
            var pieces   = App.Utils.DOM.removeAll( this.pieces );
            var shuffled = App.Utils.Array.shuffle( pieces );
            var html     = '';

            shuffled.forEach( function( piece ) {
                html += piece.outerHTML;
            });

            this.cPieces.innerHTML = html;
            this.draggable = true;
        },

        handleDrag: function() {
            this.element.addEventListener( 'dragstart', this._handleDrag);
            this.cPieces.addEventListener( 'dragstart', this._handleDrag);
        },

        handleDrop: function() {

            var self = this;

            self.element.addEventListener( 'dragover', self._allowDrop );
            self.cPieces.addEventListener( 'dragover', self._allowDrop );

            self.element.addEventListener( 'drop', function( e ) {
                e.preventDefault();

                var settings = self.settings;

                var data;
                var node;
                var nodeName;


                // Allowed elements: div.c-puzzle__hexagon and img.c-pieces__piece

                if ( !(e.target.classList.contains( 'c-puzzle__hexagon' ) ||
                       e.target.classList.contains( 'c-pieces__piece' ))     ) {
                    return;
                }

                data     = e.dataTransfer.getData('text');
                node     = App.Utils.DOM.id(data);
                nodeName = e.target.nodeName;


                if ( nodeName === 'IMG' ) {

                    // Swap enabled only for difficulty level 3 (easy mode)
                    if ( settings[ 'difficulty' ] === 3 ) {
                        App.Utils.DOM.swapElements( e.target, node );
                    }

                } else {
                    e.target.appendChild(node);
                }

            });

            self.cPieces.addEventListener( 'drop', function( e ) {
                e.preventDefault();

                var data = e.dataTransfer.getData('text');
                var node = App.Utils.DOM.id(data);

                if ( e.target.classList.contains( 'c-pieces__piece' ) ) {
                    e.target.parentNode.insertBefore( node, e.target );
                } else {
                    e.target.appendChild(node);
                }

            });
        },

        _handleDrag: function _handleDrag( e ) {

            // Allow drag only on img.c-pieces__piece elements
            if ( !e.target.classList.contains( 'c-pieces__piece' ) ) {
                return;
            }

            e.dataTransfer.setData( 'Text', e.target.id );
        },

        _allowDrop: function allowDrop( e ) {
            e.preventDefault();
        }
    };

    (function(e) {
        var element = App.Utils.DOM.$( '.c-puzzle' );
        var puzzle = new Puzzle( element );

        puzzle.start();
    })(e);
});