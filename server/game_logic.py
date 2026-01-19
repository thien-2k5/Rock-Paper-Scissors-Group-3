# server/game_logic.py

class Game:
    def __init__(self, id):
        self.id = id
        self.p1Went = False
        self.p2Went = False
        self.moves = [None, None]
        self.ready = False

    def getPlayerMove(self, p):
        return self.moves[p]

    def play(self, player, move):
        self.moves[player] = move
        if player == 0:
            self.p1Went = True
        else:
            self.p2Went = True

    def bothGone(self):
        return self.p1Went and self.p2Went

    def resetGame(self):
        self.p1Went = False
        self.p2Went = False
        self.moves = [None, None]

    def findWinner(self):
        p1 = self.moves[0]
        p2 = self.moves[1]

        if p1 == p2:
            return -1

        win_conditions = {
            "Rock": "Scissors",
            "Scissors": "Paper",
            "Paper": "Rock"
        }

        if win_conditions[p1] == p2:
            return 0
        return 1

    def isConnected(self):
        return self.ready
