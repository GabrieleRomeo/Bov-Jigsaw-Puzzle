
// The Model represents the data in the system

var PuzzleModel = (function( window, undefined ) {

  'use strict';

  function PuzzleModel() {

    this.started   = false;
    this.paused    = false;
    this.isOver    = false;
    this.pieces    = [[45],[41],[37],[33],[29],[43],[39],[35],[31],[44],[40],[36],
                      [32],[28],[42],[38],[34],[30],[27],[18],[14],[10],[6],[25],
                      [16],[12],[8],[26],[17],[13],[9],[5],[24],[15],[11],[7],[23],
                      [22],[21],[20],[19]];

    this.partial   = [];
    this.settings  = {
      audio: {
        background: '/assets/sounds/magic_clock.mp3',
        swap: '/assets/sounds/swap_sound.mp3',
        broken: '/assets/sounds/broken_glass.mp3',
        countDown: '/assets/sounds/countdown_Timer_5_sec.mp3',
        clapping: '/assets/sounds/clapping.mp3',
        fail: '/assets/sounds/fail_effect.mp3'
      },
      levels: [
        {
          ID: 0,
          name: 'easy',
          time: 7,
          icon: 'fa fa-star-o',
          tips: 3
        },
        {
          ID: 1,
          name: 'medium',
          time: 5,
          icon: 'fa fa-star-half-o',
          tips: 2
        },
        {
          ID: 2,
          name: 'hard',
          time: 3,
          icon: 'fa fa-star',
          tips: 1
        }
      ]
    };

    // Set as default level, the 'easy' level
    this.currentLevel  = this.settings.levels[0];

    // Set the count down time (in seconds)
    this.countDownTime = 5;

    // Set the count down time for the wrong sequence (in seconds)
    this.countDownWrongPiecesTime = 1.5;

    this.missingPieces = this.pieces.length;

    this.wrongPieces = 0;

    // Define how much time (in seconds) the tips will remain visible
    this.tipsTime = 5;
  }

  // The PuzzleModel can emit events
  PuzzleModel.prototype = new App.Utils.Events.Emitter();
  PuzzleModel.prototype.constructor = PuzzleModel;

  PuzzleModel.prototype.preStart = function() {

    // Give to the user the ability to set the game level only if the Game
    // didn't started yet
    if ( this.isStarted() ) {
      return;
    }

    this.started = true;

    // Emit the event
    this.emit( 'model.pre-start' );
  };

  PuzzleModel.prototype.start = function() {
    this.emit( 'model.start' );
  };

  PuzzleModel.prototype.gameOver = function() {
    this.isOver = true;
    this.emit( 'model.gameOver' );
  };

  PuzzleModel.prototype.isGameOver = function() {
    return this.isOver;
  };

  PuzzleModel.prototype.getTipsTime = function() {
    return this.tipsTime;
  };

  PuzzleModel.prototype.isStarted = function() {
    return this.started;
  };

  PuzzleModel.prototype.pauseGame = function() {
    this.paused = true;
    this.emit( 'model.pauseGame' );
  };

  PuzzleModel.prototype.resumeGame = function() {
    this.paused = false;
    this.emit( 'model.resumeGame' );
  };

  PuzzleModel.prototype.getAllPieces = function() {
    return this.pieces;
  };

  PuzzleModel.prototype.getMissingPieces = function() {
    return this.missingPieces;
  };

  PuzzleModel.prototype.decreaseMissingPieces = function() {

    this.missingPieces -= 1;
    this.emit( 'model.decreaseMissingPieces', this.missingPieces );

    // Check if the user wins
    if ( this.missingPieces === 0 && this.wrongPieces === 0 ) {
      this.emit( 'model.winnerUSER', this.missingPieces );
    }

    // Check if the puzzle has been completed but the sequence is wrong
    if ( this.missingPieces === 0 && this.wrongPieces !== 0 ) {
      this.emit( 'model.wrongSequence' );
    }

  };

  PuzzleModel.prototype.increaseMissingPieces = function() {
    this.missingPieces += 1;
    this.emit( 'model.increaseMissingPieces', this.missingPieces );
  };

  PuzzleModel.prototype.setWrongPieces = function( value ) {
    this.wrongPieces = value;
    this.emit( 'model.setWrongPieces', value );
  };

  PuzzleModel.prototype.getWrongPieces = function() {
    return this.wrongPieces;
  };

  PuzzleModel.prototype.decreaseTips = function() {

    // Show tips only if available
    if ( this.currentLevel.tips === 0 ) {
      return;
    }

    this.currentLevel.tips -= 1;
    this.paused = true;

    this.emit( 'model.pauseGame' );
    this.emit( 'model.updateTips', this.currentLevel.tips );
  };

  PuzzleModel.prototype.pauseGame = function() {
    this.paused = true;
    this.emit( 'model.pauseGame' );
  };


  PuzzleModel.prototype.getCountDownTime = function() {
    return this.countDownTime;
  };

  PuzzleModel.prototype.getCountDownWrongPiecesTime = function() {
    return this.countDownWrongPiecesTime;
  };

  PuzzleModel.prototype.getGameLevel = function() {
    return this.currentLevel;
  };

  PuzzleModel.prototype.setGameLevel = function( currentLevel ) {

    // Give to the user the ability to set the game level only if the Game
    // didn't started yet
    if ( this.isStarted() ) {
      return;
    }

    var choosenLevel = this.settings.levels.filter(function( level ) {
      return level.ID === parseInt(currentLevel);
    })[0];

    this.currentLevel = choosenLevel || this.settings.levels[0];
  };

  PuzzleModel.prototype.getLevels = function() {
    return this.settings.levels;
  };

  PuzzleModel.prototype.getSetting = function( name ) {
    return this.settings[name] ? this.settings[name] : void 0;
  };

  return PuzzleModel;

})(window);
