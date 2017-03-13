
/*
 * Define a ViewModel for the splash system which connect up a static View
 * to a data stored in a Model.
 * It parses the View for specific HTML5 data attributes and uses these as
 * instructions to affect the behaviour of the System
 *
 */

var SplashViewModel = (function( window, undefined ) {

  'use strict';

  // Utility function
  function excludeDefault( level ) {
    // Exclude level 0 - [Default], it's always present in the view
    return level.ID !== 0;
  }

  function SplashViewModel( model, splashView ) {

    var self = this;

    this.Events = App.Utils.Events;
    this.DOM    = App.Utils.DOM;

    this.model = model;
    this.view  = splashView;

    // Define the methods available to the View for selecting via HTML5 attributes
    this.methods = {

      // The setGameLevel() method will set the game's level
      setGameLevel: function( level ) {
        self.model.setGameLevel( level );
      },
      // The preStart() method will start the game
      preStart: function() {
        self.model.preStart();
      },
      // The closeSplashView() method will close the splash view
      closeSplashView: function() {
        self.view.remove();
        //self.model.startTimer();
      },
    };

    // Init the View
    this.init();
  }

  SplashViewModel.prototype.init = function() {

    var $ = this.DOM.$;

    // Grab the element from the Splash View
    this.cacheDOM = {
      startGameForm:   $( '[data-submit="startGame"]', this.view ),
      triggerInput:    $( '#c-splash__level--0', this.view ),
      changeGameLevel: $( '[data-click="changeGameLevel"]', this.view ),
      gameLevelLabel:  $( '.c-splash__label', this.view ),
      gameLevelDesc:   $( '#levelDescription', this.view )
    };

    // get the data from the Model
    this.gameLevels = this.model.getLevels();

    // At the beginning, bind to the SPLASH View the information for the default level
    this.bindSplashInformation(0);
    // Connect the Splash in the View to the Model
    this.bindSplashView();
    // Connect the Splash in the View to the Model
    this.bindForm();
    // Connect the events broadcast by the Model to the View
    this.bindEvents();
  };

  // Define a method for build the list of Game's Levels from the data
  // stored in the Model
  SplashViewModel.prototype.bindSplashView = function() {

    var self = this;
    var $    = this.DOM.$;
    var $on  = this.Events.$on;
    var inputsFragment = document.createDocumentFragment();
    var itemsFragment  = document.createDocumentFragment();

    function setLevel( event ) {

      event.stopPropagation();

      var id;

      if ( event.target.nodeName !== 'LABEL' ) {
        return;
      }

      // Get the ID from the 'value' property of the element the target point to
      id = $('#' + event.target.getAttribute('for')).value;

      // Set the selected level as the game level into the model
      self.methods['setGameLevel'](id);

      // Bind the information into the Splash View
      self.bindSplashInformation(id);
    }

    // Handle the click event over the available levels shown on the SPLASH VIEW
    $on( this.cacheDOM.changeGameLevel, 'click', setLevel );

    // Create the list of Game's Levels on the Splash View
    this.gameLevels
    .filter(excludeDefault)
    .forEach(function(level) {

      // Build Game Menu's options on the Splash View
      var newTriggerInput;
      var newItem;

      // Set property for triggers

      newTriggerInput       = self.cacheDOM.triggerInput.cloneNode();
      newTriggerInput.id    = 'c-splash__level--' + level.ID;
      newTriggerInput.value = level.ID;

      // Set property for items

      newItem = self.cacheDOM.changeGameLevel.firstElementChild.cloneNode(true);

      newItem.firstElementChild.classList = level.icon;
      newItem.lastElementChild.setAttribute('for', 'c-splash__level--' + level.ID);
      newItem.lastElementChild.textContent = level.name;

      inputsFragment.appendChild(newTriggerInput);
      itemsFragment.appendChild(newItem);

    });

    // Set the first level (easy level) as default level
    self.cacheDOM.triggerInput.click();

    // Append the new triggers input after the first one
    this.DOM.insertAfter( inputsFragment, self.cacheDOM.triggerInput );
    // Append the new Items after the first one
    this.DOM.insertAfter( itemsFragment, self.cacheDOM.changeGameLevel.firstElementChild );
  };

  // Bind the level information into the splash view
  SplashViewModel.prototype.bindSplashInformation = function( id ) {

    var level = this.gameLevels[id] || this.gameLevels[0];
    var desc  = '';

    desc += 'Maximum time for completing: ';
    desc += '<span class="c-splash__maxTime">' + level['time'] + ' minuts</span>';

    this.cacheDOM.gameLevelDesc.innerHTML = desc;
  };

  // Connect the events broadcast by the Model to the View
  SplashViewModel.prototype.bindEvents = function() {
    // When the Game Starts and the model has been set up, the model emits
    // the event which is used for closing the splash window
    this.model.on('model.pre-start', this.methods['closeSplashView']);
  };

  // Handle the submit event of the SplashView
  SplashViewModel.prototype.bindForm = function() {

    var self = this;
    var $on  = this.Events.$on;

    // When the user submit the splash form
    $on( this.cacheDOM.startGameForm, 'submit', function( event ) {
      event.preventDefault();
      // start the Game
      self.methods['preStart']();
    });
  };

  return SplashViewModel;

})(window);