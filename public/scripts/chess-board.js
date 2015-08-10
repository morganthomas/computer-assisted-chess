// Every piece object in the DOM has the class .chess-piece.

// The size of the left border of the chess squares.
var LEFT_BORDER_WIDTH_PX = 1;

function displayState(game) {
  var state = getCurrentState(game);

  $(".chess-piece").remove();

  forEachLoc(state.board, function(loc) {
    var piece = getSquare(state.board, loc);
    if (piece) {
      displayPiece(loc, piece);
    }
  });
}

// Gives the filename of the image for the given piece.
function pieceImageName(piece) {
  // XXX
  return "images/WhitePawn.png";
}

function makePieceImage(piece) {
  var $piece = $('<div><img src="' + pieceImageName(piece) + '"></div>');
  return $piece;
}

// Creates a DOM object displaying the given piece.
function displayPiece(loc, piece) {
  var squareSize = getSquareSize();
  var $piece = makePieceImage(piece);
  $piece.addClass('chess-piece');
  $piece.css("top", (7 - loc.row) * squareSize + "px");
  $piece.css("left", (loc.col * squareSize + LEFT_BORDER_WIDTH_PX)
    + "px");
  // Necessary to prevent the browser from interpreting the user as
  // attempting an image drag when they drag a piece.
  $piece.on('dragstart', function(event) {
    event.preventDefault();
  });
  $(".chess-board-origin").append($piece);
}

// Converts mouse coordinates to a location on the chess board, assuming
// the mouse coordinates are within the chess board.
function mouseToLoc(mouseX, mouseY) {
  var squareSize = getSquareSize();
  var boardPos = $(".chess-board-origin").offset();
  return { row: 7 - Math.floor((mouseY - boardPos.top) / squareSize),
           col: Math.floor((mouseX - (boardPos.left + LEFT_BORDER_WIDTH_PX))
                                / squareSize) };
}

var getSquareSize = function() {
  return $(".chess-board-origin").innerWidth();
}

chessApp.controller('chessBoardController', function($scope, challengeList) {
  var game = $scope.$parent.game;
  var processingPieceDrag = false;
  var dragStartLoc = null;
  var pieceBeingDragged = null;

  $scope.boardLocs = [];
  for (var row = game.boardInfo.numRows - 1; row >= 0; row--) {
    for (var col = 0; col < game.boardInfo.numCols; col++) {
      $scope.boardLocs.push({ row: row, col: col })
    }
  }

  $scope.squareClasses = squareClasses;

  var resetDragState = function() {
    processingPieceDrag = false;
    dragStartLoc = null;
    pieceBeingDragged.removeClass("piece-being-dragged");
    pieceBeingDragged = null;
  };

  var refreshDisplay = function() {
    displayState(game);
  };

  // Returns the CSS for the position of a piece being dragged, given the
  // event containing the mouse coordinates.
  var getDraggedPiecePosition = function(event) {
    var boardPos = $(".chess-board-origin").offset();
    var squareSize = getSquareSize();

    return {
      top: (event.pageY - (squareSize / 2) - boardPos.top) + "px",
      left: (event.pageX - (squareSize / 2) - boardPos.left) + "px"
    };
  };

  // Updates the position of the piece being dragged, given the event containing the
  // mouse coordinates. If smooth is true, animates the position change.
  var updateDraggedPiecePosition = function(event, smooth) {
    var newPos = getDraggedPiecePosition(event);
    pieceBeingDragged.css(newPos);
  }

  var mousedownHandler = function(downEvent) {
    dragStartLoc = mouseToLoc(downEvent.pageX, downEvent.pageY);
    processingPieceDrag = true;
    pieceBeingDragged = $(this);
    $(this).addClass("piece-being-dragged");
    updateDraggedPiecePosition(downEvent, false);
  };

  var mouseupHandler = function(upEvent) {
    if (processingPieceDrag) {
      endLoc = mouseToLoc(upEvent.pageX, upEvent.pageY);
      var state = getCurrentState(game);

      // XXX: Dummy code
      $scope.$apply(function() {
        $scope.$parent.performMove(dragStartLoc, endLoc);
      });

      refreshDisplay();
      resetDragState();
    }
  };

  var mousemoveHandler = function(moveEvent) {
    if (processingPieceDrag) {
      updateDraggedPiecePosition(moveEvent, false);
    }
  };

  $scope.$on('move', function(event, data) {
    refreshDisplay();
  });

  // XXX: timeout hack
  setTimeout(function() {
    $("#chess-board").on("mousedown", ".chess-piece", mousedownHandler);
    $('body').on('mousemove', mousemoveHandler);
    $("#chess-board").on("mouseup", mouseupHandler);
    $(window).on('resize', refreshDisplay);

    refreshDisplay();
  }, 1000);
})

// Gives the CSS classes for a square, based on its location.
var squareClasses = function(loc) {
  var classes = "";

  if (loc.col === 0 && loc.row === 7) {
    classes += "chess-board-origin ";
  }

  if (loc.col === 0) {
    classes += "col-leftmost ";
  } else if (loc.col === 7) {
    classes += "col-rightmost ";
  }

  if (loc.row === 7) {
    classes += "row-top ";
  } else if (loc.row === 0) {
    classes += "row-bottom ";
  }

  if (loc.row % 2 === loc.col % 2) {
    classes += "black-square ";
  } else {
    classes += "white-square ";
  }

  return classes;
};