/*
 * Define a ViewModel for the Info system which connect up a static View
 * to a data stored in a Model.
 * It parses the View for specific HTML5 data attributes and uses these as
 * instructions to affect the behaviour of the System
 *
 * It handles the 'Timer and Statistics' sections
 *
 */


var InfoViewModel = (function(window, undefined) {

  'use strict';

  function InfoViewModel( model, infoView ) {
    var self = this;

    this.Events = App.Utils.Events;
    this.DOM    = App.Utils.DOM;

    this.model = model;
    this.view  = infoView;

    this.timer = null;

    // Define the methods available to the View for selecting via HTML5 attributes
    this.methods = {

      getTips: function() {
        self.model.decreaseTips();
      },

      restartGame: function() {
        window.location.reload();
      },

      closeModal: function() {
        // Resume the Game if it's not over
        if ( !self.model.isGameOver() ) {
          self.model.resumeGame();
        }

        self.DOM.$('[data-modal-restart]', self.view ).remove();
      },

      showModalRestart: function() {
        self.model.pauseGame();
        self.renderModalRestart();
      },

      toggleAudio: function() {

        // Toggle Audio only if the game has been started
        if ( !self.model.isStarted() ) {
            return;
        }

        self.model.toggleAudio();
      }

    };

    // Init the View
    this.init();
  }

  InfoViewModel.prototype = {

    constructor: InfoViewModel,

    init: function() {

      var $  = this.DOM.$;
      var $$ = this.DOM.$$;

      this.cacheDOM = {
        toggleAudio:     $( '[data-click="toggleAudio"]',  this.view ),
        minutes:         $( '#timer #min', this.view ),
        seconds:         $( '#timer #sec', this.view ),
        clockTime:       $( '[data-clock]', this.view ),
        timeLevel:       $( '[data-time]', this.view ),
        pause:           $( '.c-timer__icon--pause', this.view ),
        statsgameLevel:  $( '[data-game-level]', this.view ),
        statsTotPieces:  $( '[data-total-pieces]', this.view ),
        statsMissPieces: $( '[data-missing-pieces]', this.view ),
        statsWrngPieces: $( '[data-wrong-pieces]', this.view ),
        statsAvailTips:  $( '[data-available-tips]', this.view ),
        buttons:         $$( '[data-click]', this.view ),
        hintsButton:     $( '[data-click="getTips"]', this.view ),
        modalRestart:    $( '[data-modal-restart]', this.view )
      };

      // Store the total length of the path in user units
      this.minutesLength = this.cacheDOM.minutes.getTotalLength();
      this.secondsLength = this.cacheDOM.seconds.getTotalLength();

      // Preload Audio Settings from the model
      this.audioSettings = this.model.getSetting( 'audio' );

      // Connect the events broadcast by the Model to the View
      this.bindEvents();
    },

    showTimer: function() {
      this.view.parentElement.style.display = 'initial';
    },

    // Init the GAME TIMER
    initTimer: function() {
      // Get the Game Level from the model
      this.gameLevel = this.model.getGameLevel();
      // Set a new Timer based on the game level's time
      this.timer = new App.DateTime.Timer( this.gameLevel.time * 60 );

      // Set the clock info
      this.cacheDOM.timeLevel.innerHTML = this.timer.getInitialTime();

      this.cacheDOM.clockTime.innerHTML = this.timer.getMinutes(true) + ':' + this.timer.getSeconds(true);

      // When the Timer is running, update the clock view
      this.timer.on( this.timer.ID + '-tick' , this.updateClockView.bind(this) );

      // GAME OVER
      this.timer.once( this.timer.ID + '-elapsedTime' , this.gameOver.bind(this) );
    },

    updateClockView: function( currentTime, hour, minutes, seconds ) {

      var gameLevel = this.gameLevel;
      var time = '';
      var newMin = ( this.minutesLength *  minutes ) / gameLevel.time;
      var newSec = ( this.secondsLength *  seconds ) / 60;

      if ( minutes === '00' && seconds === 59 ) {
        console.log('ok');
        this.cacheDOM.seconds.setAttribute( 'style', 'stroke: rgb(222, 6, 6);');
      }

      if ( minutes === '00' ) {
        time += '<span class="c-info__span--critical">';
      } else {
        time += '<span class="c-info__span--highlight">';
      }

      time +=   minutes + ':' + seconds;
      time += '</span>';

      this.cacheDOM.clockTime.innerHTML = time;

      this.cacheDOM.minutes.setAttribute( 'stroke-dasharray', newMin + ','+ this.minutesLength );
      this.cacheDOM.seconds.setAttribute( 'stroke-dasharray', newSec + ','+ this.secondsLength );
    },

    gameOver: function() {
      this.model.gameOver();
    },

    setupStatistics: function() {

      var totPieces = this.model.getAllPieces().length;

      this.cacheDOM.statsgameLevel.innerHTML = this.gameLevel.name;

      this.cacheDOM.statsTotPieces.innerHTML = totPieces;
      //At the beginning the total number of missing pieces is the same as the total
      // number of pieces
      this.cacheDOM.statsMissPieces.innerHTML = totPieces;

      this.cacheDOM.statsWrngPieces.innerHTML = '-';

      this.cacheDOM.statsAvailTips.innerHTML = this.gameLevel.tips;
    },

    updateMissingPieces: function( value ) {
      this.cacheDOM.statsMissPieces.innerHTML =  value;
    },

    updateWrongPieces: function( value ) {
      this.cacheDOM.statsWrngPieces.innerHTML =  value;
    },

    updateTips: function( value ) {
      this.cacheDOM.statsAvailTips.innerHTML =  value;
    },

    disableTips: function( target ) {
      target.disabled = true;
    },

    enableTips: function( target ) {
      target.disabled = false;
    },

    pauseTimer: function() {
      this.timer.pause();
    },

    resumeTimer: function() {
      this.timer.resume();
    },

    pauseView: function() {
      // Pause the Timer
      this.pauseTimer();
      // Disable the Tips Button
      this.disableTips( this.cacheDOM.hintsButton );
    },

    enableView: function() {
      // Start the timer
      this.resumeTimer();

      // Enable the toggle Audio button
      this.cacheDOM.toggleAudio.classList.add( 'c-info__icon--hoverable' );

      if ( this.gameLevel.tips > 0 ) {
        // Enable the Tips Button
        this.enableTips( this.cacheDOM.hintsButton );
      }
    },

    renderModalRestart: function() {

      var html = '';

      html += '<div class="c-modal c-modal--full" data-modal-restart>';
      html += '  <div class="l-grid">';
      html += '    <div class="c-modal__header">';
      html += '      <i class="c-modal__closeIcon fa fa-times"';
      html += '         aria-hidden="true"';
      html += '         data-click="closeModal"></i>';
      html += '      <h2 class="c-modal__title">';
      html += '        Do you want to restart the game?';
      html += '      </h2>';
      html += '    </div>';
      html += '    <div class="c-modal__body">';
      html += '    <input class="c-info__button"';
      html += '           type="button"';
      html += '           value="Yes, restart the Game"';
      html += '           data-click="restartGame">';
      html += '    </div>';
      html += '</div>';

      // Insert the Modal View before the end of the c-info View
      this.view.insertAdjacentHTML( 'beforeend', html );
    },

    renderModalGameOver: function() {

      var html = '';

      html += '<div class="c-modal c-modal--full c-modal--interaction">';
      html += '  <div class="l-grid l-grid--transparent">';
      html += '    <div class="c-modal__header">';
      html += '      <h2 class="c-modal__title c-modal__title--zoomIN">';
      html += '        GAME OVER';
      html += '      </h2>';
      html += '    </div>';
      html += '</div>';

      // Insert the Modal View before the end of the c-info View
      this.view.insertAdjacentHTML( 'beforeend', html );
    },

    renderModalWinner: function() {

      var html  = '';

      html += '<div class="c-modal c-modal--full c-modal--interaction">';
      html += '  <div class="l-grid l-grid--transparent">';
      html += '    <div class="c-modal__header">';
      html += '      <h2 class="c-modal__title c-modal__title--zoomIN">';
      html += '        Congratulations! You Win';
      html += '        <i class="c-info__icon';
      html += '                  c-info__icon--winner fa fa-trophy"';
      html += '            aria-hidden="true"></i>';
      html += '      </h2>';
      html += '    </div>';
      html += '</div>';

      // Insert the Modal View before the end of the c-info View
      this.view.insertAdjacentHTML( 'beforeend', html );
    },

    renderModalWrongSequence: function() {

      var self  = this;

      var time  = this.model.getCountDownWrongPiecesTime();
      var timer = new App.DateTime.Timer(time);
      var html = '';

      html += '<div class="c-modal c-modal--full c-modal--interaction" id="t' + timer.ID +'">';
      html += '  <div class="l-grid l-grid--transparent">';
      html += '    <div class="c-modal__header">';
      html += '      <h2 class="c-modal__title c-modal__title--flash">';
      html += '        Wrong sequence. Please check your pieces';
      html += '      </h2>';
      html += '      <i class="c-info__icon';
      html += '                c-info__icon--exclamation fa fa-exclamation-triangle"';
      html += '          aria-hidden="true"></i>';
      html += '    </div>';
      html += '</div>';

      // Insert the Modal View before the end of the c-info View
      this.view.insertAdjacentHTML( 'beforeend', html );

      timer.start();

      // Remove the Modal
      timer.on( timer.ID + '-elapsedTime', function() {
        self.DOM.$('#t' + timer.ID).remove();
      });
    },

    loadClappingAudio: function() {

      var audio = document.createElement( 'AUDIO' );
      var clappingSrc = this.audioSettings['clapping'];

      audio.setAttribute( 'src' , clappingSrc );
      audio.autoplay = true;

      // Append the element into the view
      this.view.appendChild(audio);
    },

    loadGameOverAudio: function() {

      var audio = document.createElement( 'AUDIO' );
      var failSrc = this.audioSettings['fail'];

      audio.setAttribute( 'src' , failSrc );
      audio.autoplay = true;

      // Append the element into the view
      this.view.appendChild(audio);
    },

    toggleAudioButton: function( isAudioEnabled ) {
        var newStatus = isAudioEnabled ? 'on' : 'off';
        var currentS = !isAudioEnabled ? 'on' : 'off';
        var title = isAudioEnabled ? 'Disable' : 'Enable';
        var baseAudioClass = 'fa-volume';
        this.cacheDOM.toggleAudio.classList.remove( baseAudioClass + '-' + currentS );
        this.cacheDOM.toggleAudio.classList.add( baseAudioClass + '-' + newStatus );
        this.cacheDOM.toggleAudio.setAttribute( 'title', title + ' audio' );
    },

    // Connect the events broadcast by the Model to the View
    bindEvents: function() {

      var self = this;

      function setupTimer() {

        // Show the Timer in the View
        self.showTimer();

        // Init the Timer
        self.initTimer();
      }

      // Handle all the actions for the Winner User
      function winnerAction() {

        // Prevent user interaction
        self.pauseView();

        // Show Modal Winner
        self.renderModalWinner();

        // Play Clapping Audio
        self.loadClappingAudio();
      }

      // Handle GAME OVER actions
      function gameOverAction() {

        // Prevent user interaction
        self.pauseView();

        // Show Modal GAME OVER
        self.renderModalGameOver();

        // Play FAIL Audio
        self.loadGameOverAudio();
      }

      // Handle clicks related to data-click HTML5 attributes
      this.view.addEventListener( 'click' , function( event ) {

        event.stopPropagation();

        var methodName = event.target.getAttribute( 'data-click' );

        if ( !methodName ) {
          return;
        }

        // Locate the given method in the ViewModel's 'methods' property and
        // execute it
        if ( self.methods[methodName] && typeof self.methods[methodName] === 'function') {
          self.methods[methodName](event);
        }

      });

      this.model.on( 'model.pre-start' , setupTimer );
      this.model.on( 'model.pre-start' , this.setupStatistics.bind(this) );
      this.model.on( 'model.start' , this.enableView.bind(this) );
      this.model.on( 'model.decreaseMissingPieces' , this.updateMissingPieces.bind(this) );
      this.model.on( 'model.increaseMissingPieces' , this.updateMissingPieces.bind(this) );
      this.model.on( 'model.setWrongPieces' , this.updateWrongPieces.bind(this) );
      this.model.on( 'model.updateTips' , this.updateTips.bind(this) );
      this.model.on( 'model.pauseGame' , this.pauseView.bind(this) );
      this.model.on( 'model.resumeGame' , this.enableView.bind(this) );

      this.model.on( 'model.wrongSequence', this.renderModalWrongSequence.bind(this));

      this.model.on( 'model.toggleAudio', this.toggleAudioButton.bind(this) );

      this.model.on( 'model.gameOver' , gameOverAction );

      this.model.on( 'model.winnerUSER' , winnerAction );
    }
  };

  return InfoViewModel;

})(window);