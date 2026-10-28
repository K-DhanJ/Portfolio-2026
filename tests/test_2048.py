"""Tests du moteur Python, indépendants de Brython et de l’affichage web."""
import sys
import unittest
import random
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'games' / '2048'))
from engine import merge_line, move_board, Game2048, has_moves


class Rules2048(unittest.TestCase):
    def test_single_merge_per_turn(self):
        self.assertEqual(merge_line([2, 2, 4, 0]), ([4, 4, 0, 0], 4))
        self.assertEqual(merge_line([2, 2, 2, 2]), ([4, 4, 0, 0], 8))
        self.assertEqual(merge_line([0, 4, 0, 4]), ([8, 0, 0, 0], 8))

    def test_all_directions_and_no_mutation(self):
        board = [[2, 2, 0, 0]] + [[0] * 4 for _ in range(3)]
        right, points, changed = move_board(board, 'right')
        self.assertEqual(right[0], [0, 0, 0, 4])
        self.assertEqual(points, 4)
        self.assertTrue(changed)
        self.assertEqual(board[0], [2, 2, 0, 0])
        vertical = [[2, 0, 0, 0], [2, 0, 0, 0], [0] * 4, [0] * 4]
        self.assertEqual(move_board(vertical, 'down')[0][3][0], 4)
        self.assertEqual(move_board(vertical, 'up')[0][0][0], 4)
        self.assertEqual(move_board(board, 'left')[0][0][0], 4)

    def test_invalid_move_does_not_spawn(self):
        game = Game2048(random.Random(1))
        game.board = [[2, 0, 0, 0]] + [[0] * 4 for _ in range(3)]
        before = [row[:] for row in game.board]
        self.assertEqual(game.move('left'), (False, 0))
        self.assertEqual(game.board, before)
        self.assertEqual(game.turns, 0)

    def test_spawn_reset_and_scoring(self):
        game = Game2048(random.Random(5))
        self.assertEqual(sum(bool(v) for row in game.board for v in row), 2)
        game.board = [[2, 2, 0, 0]] + [[0] * 4 for _ in range(3)]
        game.move('left')
        self.assertEqual(game.score, 4)
        self.assertEqual(game.turns, 1)
        self.assertEqual(sum(bool(v) for row in game.board for v in row), 2)
        game.reset()
        self.assertEqual((game.score, game.turns), (0, 0))

    def test_end_and_win(self):
        board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
        self.assertFalse(has_moves(board))
        board[0][0] = 4
        self.assertTrue(has_moves(board))
        game = Game2048()
        game.board[0] = [1024, 1024, 0, 0]
        game.move('left')
        self.assertTrue(game.won)


if __name__ == '__main__':
    unittest.main()
