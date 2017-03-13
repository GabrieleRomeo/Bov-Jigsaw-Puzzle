
/*
 * Define a ViewModel for the Puzzle system which connect up a static View
 * to a data stored in a Model.
 *
 */

var PuzzleViewModel = (function(window, undefined) {

  'use strict';

  function PuzzleViewModel( model, puzzleView ) {

    this.Events = App.Utils.Events;
    this.DOM    = App.Utils.DOM;

    this.model = model;
    this.view  = puzzleView;

    // Define the methods available to the View for selecting via HTML5 attributes
    this.methods = {

    };

    // Init the View
    this.init();
  }

  PuzzleViewModel.prototype = {

    constructor: PuzzleViewModel,


    init: function() {

      var $  = this.DOM.$;
      var $$ = this.DOM.$$;

      this.cacheDOM = {
        puzzleView:      $( '.c-puzzle', this.view ),
        countDown:       $( '.c-countDown', this.view ),
        countDownNumber: $( '[data-counter]', this.view ),
        piecesDesk:      $( '.c-pieces',  this.view ),
        pieces:         $$( '.c-pieces__piece',  this.view ),
        hexagons:       $$( '.c-puzzle__hexagon',  this.view ),
        unsolvedImg:     $( '.c-puzzle__img--unsolved', this.view )
      };

      // Preload Audio Settings from the model
      this.audioSettings = this.model.getSetting( 'audio' );

      // Preload the background sound
      this.loadBackgroundSounds();
      // Connect the events broadcast by the Model to the View
      this.bindEvents();
    },

    removePieces: function() {
      this.cacheDOM.pieces.forEach(function(piece) {
        piece.remove();
        piece.classList.remove( 'c-pieces__piece--falling' );
      });
    },

    shuffleAndAddPieces: function() {

      var list     = this.model.getAllPieces();
      var shuffled = App.Utils.Array.shuffle(list);
      var fragment = document.createDocumentFragment();

      shuffled.forEach(function(piece) {

        var image = document.createElement( 'IMG' );

        image.classList.add( 'c-pieces__piece' );
        image.classList.add( 'c-pieces__piece--fromBottom' );

        image.setAttribute('ID', piece);
        image.setAttribute('data-piece', piece);
        image.setAttribute('src', 'assets/img/piece_' + piece + '.png');
        image.setAttribute('draggable', true);
        image.setAttribute('alt', 'Puzzle\'s piece number' + piece);

        fragment.append(image);
      });

      // Show a dashed border
      this.cacheDOM.piecesDesk.classList.add( 'c-pieces--dashed' );
      // Append the entire fragment to the DOM
      this.cacheDOM.piecesDesk.append(fragment);
    },

    showPuzzle: function() {
      this.view.style.display = 'initial';
    },

    loadBackgroundSounds: function() {

      var backgroundAudio = document.createElement( 'AUDIO' );
      var swapAudio       = document.createElement( 'AUDIO' );

      var backgrondSrc = this.audioSettings['background'];
      var swapSrc      = this.audioSettings['swap'];

      backgroundAudio.setAttribute( 'src' , backgrondSrc );
      backgroundAudio.setAttribute( 'preload' , 'auto');
      backgroundAudio.volume   = .3;
      backgroundAudio.loop = true;

      swapAudio.setAttribute( 'src' , swapSrc );
      swapAudio.setAttribute( 'preload' , 'auto');
      swapAudio.volume   = 1;

      // Add Audios into the cache
      this.cacheDOM['backgroundAudio'] = backgroundAudio;
      this.cacheDOM['swapAudio']       = swapAudio;

      // Append the elements into the view
      this.view.appendChild(backgroundAudio);
      this.view.appendChild(swapAudio);
    },

    fallingDown: function() {

      var list = App.Utils.Array.toArr(this.cacheDOM.pieces);
      var audio = document.createElement( 'AUDIO' );

      var brokenSrc = this.audioSettings['broken'];


      // Add the broken glasses effect
      audio.setAttribute( 'src' , brokenSrc );
      audio.autoplay = true;
      audio.volume   = .5;
      this.view.appendChild(audio);
      audio.load();

      // Add to each piece the falling down animation class
      list.forEach(function(piece) {
        piece.classList.add( 'c-pieces__piece--falling' );
      });

      this.removeCountDown();

    },

    initCountDown: function() {

      var countDownTime = this.model.getCountDownTime();

      this.countDownTimer  = new App.DateTime.Timer(countDownTime);

      var audio = document.createElement( 'AUDIO' );

      var countDownSrc = this.audioSettings['countDown'];

      audio.setAttribute( 'src' , countDownSrc );
      audio.autoplay = true;

      // Append the element into the view
      this.view.appendChild(audio);

      // Handle the events triggered by the CountDown Timer
      this.countDownTimer.on( this.countDownTimer.ID + '-tick', this.updateCountDown.bind(this) );
      this.countDownTimer.on( this.countDownTimer.ID + '-elapsedTime', this.fallingDown.bind(this) );
    },

    updateCountDown: function() {

      var countDownNumber = this.cacheDOM.countDownNumber;
      var newNumber = countDownNumber.cloneNode();

      newNumber.textContent = this.countDownTimer.getSeconds();

      this.DOM.insertAfter(newNumber, countDownNumber);
    },

    removeCountDown: function() {
      this.cacheDOM.countDown.remove();
    },

    handleDrag: function() {

      var puzzleView = this.cacheDOM.puzzleView;
      var deskView   = this.cacheDOM.piecesDesk;

      puzzleView.addEventListener( 'dragstart', this._handleDrag );
      deskView.addEventListener( 'dragstart', this._handleDrag );
    },

    disableDrag: function() {

      var puzzleView = this.cacheDOM.puzzleView;
      var deskView   = this.cacheDOM.piecesDesk;

      puzzleView.removeEventListener( 'dragstart', this._handleDrag );
      deskView.removeEventListener( 'dragstart', this._handleDrag );
    },

    handleDrop: function() {

      var puzzleView = this.cacheDOM.puzzleView;
      var deskView   = this.cacheDOM.piecesDesk;

      puzzleView.addEventListener( 'dragover', this._allowDrop );
      deskView.addEventListener( 'dragover', this._allowDrop );

      puzzleView.addEventListener( 'drop', this._handlePuzzleDrop.bind(this) );
      deskView.addEventListener( 'drop', this._handleDeskDrop.bind(this) );
    },

    disableDrop: function() {

      var puzzleView = this.cacheDOM.puzzleView;
      var deskView   = this.cacheDOM.piecesDesk;

      puzzleView.removeEventListener( 'dragover', this._allowDrop );
      deskView.removeEventListener( 'dragover', this._allowDrop );

      puzzleView.removeEventListener( 'drop', this._handlePuzzleDrop.bind(this) );
      deskView.removeEventListener( 'drop', this._handleDeskDrop.bind(this) );
    },

    _handleDrag: function( event ) {

      // Allow drag only on img.c-pieces__piece elements
      if ( !event.target.classList.contains( 'c-pieces__piece' ) ) {
        return;
      }

      event.dataTransfer.setData( 'Text', event.target.id );
    },

    _handlePuzzleDrop: function( event ) {

      event.preventDefault();

      var data;
      var node;
      var nodeName;
      var target = event.target;


      // Prevent elements that are not div.c-puzzle__hexagon or img.c-pieces__piece
      // from being dropped
      if ( !(target.classList.contains( 'c-puzzle__hexagon' ) ||
             target.classList.contains( 'c-pieces__piece' ))     ) {
        return;
      }

      data     = event.dataTransfer.getData('text');
      node     = App.Utils.DOM.id(data);
      nodeName = target.nodeName;


      // Play Swap Sound
      this.cacheDOM.swapAudio.play();

      // When the target is another Image, it means that the user wants to swap the
      // two pieces
      if ( nodeName === 'IMG' ) {

        /*
         * If the node contains the class c-pieces__piece--fromBottom means that it
         * comes from the desk. We are trying to swap a node from the Desk to the
         * puzzle, so we need to add again the class c-pieces__piece--fromBottom
         * to the target node (which comes back to the Desk) and we need to inform
         * the model
         */
        if ( node.classList.contains( 'c-pieces__piece--fromBottom' ) ) {
          target.classList.add( 'c-pieces__piece--fromBottom' );
          node.classList.remove( 'c-pieces__piece--fromBottom' );
        }

        // Swap the elements
        App.Utils.DOM.swapElements( target, node );

      } else {
        // Here the target is a .c-puzzle__hexagon DIV
        target.appendChild(node);
      }

      // If the node contains the class c-pieces__piece--fromBottom means that it
      // comes from the desk, so we need to inform the model
      if ( node.classList.contains( 'c-pieces__piece--fromBottom' ) ) {
        node.classList.remove( 'c-pieces__piece--fromBottom' );
        this.model.decreaseMissingPieces();
      }

      // Estimate the number of wrong pieces
      this._estimateWrongPieces();


    },

    _handleDeskDrop: function( event ) {

      event.preventDefault();

      var data = event.dataTransfer.getData('text');
      var node = App.Utils.DOM.id(data);

      // When the target is another image with class c-pieces__piece,
      // insert the new node before the target
      if ( event.target.classList.contains( 'c-pieces__piece' ) ) {
        event.target.parentNode.insertBefore( node, event.target );
      } else {
        event.target.appendChild(node);
      }

      if ( !node.classList.contains( 'c-pieces__piece--fromBottom' ) ) {
        // We need to add again the class c-pieces__piece--fromBottom
        // and inform the model
        node.classList.add( 'c-pieces__piece--fromBottom' );
        this.model.increaseMissingPieces();
      }

      // Estimate the number of wrong pieces
      this._estimateWrongPieces();

      // Play Swap Sound
      this.cacheDOM.swapAudio.play();
    },

    enablePuzzleImg: function() {
      this.cacheDOM.unsolvedImg.classList.remove( 'c-puzzle__img--disabled' );
    },

    disablePuzzleImg: function() {
      this.cacheDOM.unsolvedImg.classList.add( 'c-puzzle__img--disabled' );
    },

    pauseBackgroundSound: function() {
      this.cacheDOM.backgroundAudio.pause();
    },

    playBackgroundSound: function() {
      this.cacheDOM.backgroundAudio.play();
    },

    _allowDrop: function( event ) {
      event.preventDefault();
    },

    // Estimate the number of wrong pieces
    _estimateWrongPieces: function() {

      var list = App.Utils.Array.toArr(this.cacheDOM.hexagons);
      var wrng;

      wrng = list.filter(function( hexagon ) {
        return hexagon.children.length > 0;
      }).filter(function( hexagon ) {
        var child = hexagon.firstElementChild;
        return hexagon.getAttribute('data-piece') !== child.getAttribute('data-piece');
      });

      this.model.setWrongPieces( wrng.length );
    },

    showTip: function() {

      var self = this;
      var tipsTime = self.model.getTipsTime();
      var timer = new App.DateTime.Timer( tipsTime );
      var img = document.createElement( 'IMG' );

      img.classList.add( 'c-puzzle__img' );
      img.classList.add( 'c-puzzle__img--solved' );

      img.setAttribute( 'src' , 'assets/img/puzzle_solved.png' );
      img.setAttribute( 'alt' , 'Solved Puzzle' );

      this.cacheDOM.puzzleView.append(img);

      timer.start();
      timer.on( timer.ID + '-elapsedTime', function() {
        img.remove();
        self.model.resumeGame();
      });

    },

    // Connect the events broadcast by the Model to the View
    bindEvents: function() {

      var self = this;


      function preView() {

        // Set game level
        self.gameLevel = self.model.getGameLevel();

        // Init the countDown Timer
        self.initCountDown();

        // Show the puzzle view
        self.showPuzzle();

        // Start the countDown Timer
        self.countDownTimer.start();
      }


      function reorganizePuzzle() {

        // Remove pieces after the falling down animation
        self.removePieces();

        // Add each piece to the "virtual desk" under the unsolved image
        self.shuffleAndAddPieces();

        // Start the Game
        self.model.start();

        // Start the background sound
        self.playBackgroundSound();
      }

      function handleDragAndDrop() {
        self.handleDrag();
        self.handleDrop();
        self.playBackgroundSound();
        self.enablePuzzleImg();
      }

      function disableDragAndDrop() {
        self.disableDrag();
        self.disableDrop();
        self.pauseBackgroundSound();
        self.disablePuzzleImg();
      }

      // When the falling down animation ends, remove each piece from the original
      // place, remove the animation class from them, and add them to the desk
      App.Utils.Events.$prefixedOn(this.cacheDOM.pieces[0],'animationend', reorganizePuzzle);

      // Connect the preView function to the event triggered by the Model
      this.model.on( 'model.pre-start' , preView );

      // Connect the preView function to the event triggered by the Model
      this.model.on( 'model.start' , handleDragAndDrop );
      this.model.on( 'model.updateTips' , this.showTip.bind(this) );

      this.model.on( 'model.pauseGame', disableDragAndDrop );
      this.model.on( 'model.resumeGame', handleDragAndDrop );

      this.model.on( 'model.winnerUSER' , this.pauseBackgroundSound.bind(this) );
      this.model.on( 'model.gameOver', disableDragAndDrop );
    }
  };

  return PuzzleViewModel;

})(window);