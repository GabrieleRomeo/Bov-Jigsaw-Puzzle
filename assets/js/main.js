
document.addEventListener('DOMContentLoaded', function() {

  var puzzleModel = new PuzzleModel();
  var view        = document.body;
  var splashView  = App.Utils.DOM.$( '.c-splash' );
  var infoView    = App.Utils.DOM.$( '.c-info' );
  var puzzleView  = App.Utils.DOM.$( 'main[role="main"]' );

  // Initialize the Views
  var splashViewModel = new SplashViewModel(puzzleModel, splashView);
  var infoViewModel   = new InfoViewModel(puzzleModel, infoView);
  var puzzleViewModel = new PuzzleViewModel(puzzleModel, puzzleView);

});