export const ch18 = {
  id: 18,
  sections: [
    {
      "title": "What is the best strategy to win everyone?",
      "body": "<p>Adversarial search is a method for competitive games where two or more players have to win each other. Each agent(player) plans moves against an opponent who actively works to defeat it.\n<br>\n<ul>\n<li>Zero-Sum Games: One player gains only what the other player loses. Common examples include chess and tic-tac-toe.\n<br>\n<li>Minimax Algorithm: The algorithm calculates the best move with assumption that the opponent plays rationally. The MAX player selects moves with the highest score. The MIN player selects moves with the lowest score.\n<br>\n<li>Alpha-Beta Pruning: This technique removes branches in the search tree that do not change the final choice. It reduces computation time.\n<li> Expectimax is a search algorithm for environments with uncertain outcomes or non-optimal opponents. It models chance events and sub-optimal adversary actions.\n<br>\n<br>\n<br>\nIn the vertical tug-of-war rope game below, you can see a Minimax, Alpha-Beta Pruning, and Expectiminimax visualization. Play as MAX first by selecting one of the three athletes to pull the rope upwards as high as possible! Then switch to MIN to select one of the three counter-athletes and pull the rope downwards.\n</p>"
    }
  ],
}
