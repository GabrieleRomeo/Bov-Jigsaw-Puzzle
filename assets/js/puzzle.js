'use strict';

document.addEventListener('DOMContentLoaded', function (e) {

/*
    function Puzzle( element ) {
        this.element = element;
        this.init();
    }
*/

    function Puzzle( pieces ) {
        this.pieces = App.Utils.Array.toArr( pieces );
        this.timer  = null;
        this.settings  = {
            difficulty: 3,
            time: 60 * 9,
        };
    }

    Puzzle.prototype = {
        constructor: Puzzle,

        init: function( settings ) {

            this.timer = new App.DateTime.Timer( this.settings.time );
            //this.cPieces   = App.Utils.DOM.$( '.c-pieces' );
            //this.pieces    = App.Utils.DOM.$$( '.c-pieces__piece' );

            //this.handleDrag();
            //this.handleDrop();

        },

        getPieces: function() {
            return this.pieces;
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
        var DOM = App.Utils.DOM;
        var $   = DOM.$;
        var $$  = DOM.$$;


        var element = $( '.c-puzzle' );

        var elements = {
            puzzle: $( '.c-puzzle' ),
            pieces: $$( '.c-pieces__piece' ),
            piecesContainer: $( '.c-pieces' ),
            playPauseButton: $( '.c-timer__icon--pause' ),
            clock: {
                minutes: $('#timer #min'),
                seconds: $('#timer #sec'),
                clock: $('.c-timer__span--isActive'),
                pause: $('.c-timer__icon--pause')
            }
        };


        var model = new Puzzle( elements.pieces );
        var view = new View(elements);
        var presenter = new Presenter(model, view);

        var minLength = min.getTotalLength();
        var secLength = sec.getTotalLength();

        //var timer = new App.DateTime.Timer(fiveMinutes);




        //timer.start();

        /*
        pause.addEventListener( 'click' , function() {
            if (!timer.isPaused()) {
                timer.pause();
                this.classList.remove('fa-pause');
                this.classList.add('fa-play');
            } else {
                timer.resume();
                this.classList.remove('fa-play');
                this.classList.add('fa-pause');
            }
        });

        timer.on('tick', function () {
            var tmin = parseInt(timer.info[ 'minutes' ]);
            var tsec = parseInt(timer.info[ 'seconds' ]);
            var newMin = ( minLength *  tmin ) / 5;
            var newSec = ( secLength *  tsec ) / 60;

            clock.innerHTML = timer.info[ 'minutes' ] + ':' + timer.info[ 'seconds' ];

            min.setAttribute('stroke-dasharray', newMin + ','+ minLength);
            sec.setAttribute('stroke-dasharray', newSec + ','+ secLength);
        });

        */

        //puzzle.start();
    })(e);
});