var Presenter = (function() {
    'use strict';

    function Presenter( model, view ) {
        this.model = model;
        this.view  = view;
    }

    Presenter.prototype = {
        constructor: Presenter,

        init: function() {
            var self = this;
            var elements = self.view.elements;
            var $on  = App.Utils.Events.$on;

            $on( elements.playPauseButton, 'click', function() {
                self.start();
            });
        },

        start: function() {
            var pieces   = this.model.getPieces();
            var shuffled = App.Utils.Array.shuffle( pieces );
            var html     = '';

            shuffled.forEach( function( piece ) {
                html += piece.outerHTML;
            });

            this.view.elements.piecesContainer.innerHTML = html;
        }
    };

    return Presenter;
})();