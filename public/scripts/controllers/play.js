chessApp.directive('chessPieceTypeDisplay', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/piece-type-display',
    scope: {
      pieceType: '=chessPieceType'
    }
  }
})

chessApp.controller('playController', function($scope, $routeParams, me, challengeList, socket, $rootScope) {
  $scope.$parent.notAtHome = true;
  $scope.pieceTypeToDisplay = null; // set by chessBoard.js

  // Checks if a move from startLoc to endLoc is legal. If so, updates the
  // game state to reflect the move and sends the move to the server.
  $scope.performMove = function(startLoc, endLoc) {
    var move = constructMove(getCurrentState($scope.game), startLoc, endLoc);

    if (moveIsLegal($scope.game, move)) {
      executeMoveInGame($scope.game, move);

      socket.emit('move', {
        game: $scope.game._id,
        move: move,
        index: getCurrentStateIndex($scope.game)
      });
    }
  }

  whenActiveChallengesLoaded($scope, challengeList, function() {
    var challengeId = $routeParams.id;
    var challenge = _.find(challengeList, function(challenge) {
      return challenge._id === challengeId;
    });
    $scope.game = challenge.game;
    console.log(challenge.game.pieceTypes);

    // Find the white and black players so we know their usernames in the view.
    // The game object just includes the player IDs.
    $scope.players = {};
    var players = [challenge.sender, challenge.receiver];
    var whitePlayer = challenge.sender._id === $scope.game.players.white ? 0 : 1;
    $scope.players.white = players[whitePlayer];
    $scope.players.black = players[1 - whitePlayer];

    $scope.playControllerInitialized = true;
    $scope.$broadcast('play-controller-initialized');
  });
})
