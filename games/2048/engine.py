"""Règles du 2048 en Python pur, testables sans navigateur.

La grille est une liste de quatre lignes ; zéro représente une case vide.
Le code d’affichage reste séparé pour pouvoir tester chaque règle isolément.
"""
import random


def merge_line(line):
    """Tasser à gauche, fusionner chaque paire une seule fois, compléter de zéros."""
    values = [value for value in line if value]
    merged, points, index = [], 0, 0
    while index < len(values):
        if index + 1 < len(values) and values[index] == values[index + 1]:
            value = values[index] * 2
            merged.append(value)
            points += value
            index += 2  # La nouvelle tuile ne fusionne pas à nouveau ce tour-ci.
        else:
            merged.append(values[index])
            index += 1
    return merged + [0] * (len(line) - len(merged)), points


def move_board(board, direction):
    """Réutiliser une même fusion pour les quatre directions, sans modifier l’entrée."""
    if direction not in ('left', 'right', 'up', 'down'):
        raise ValueError('Direction inconnue')
    result = [row[:] for row in board]
    total = 0
    for index in range(4):
        # Les colonnes deviennent des lignes ; droite/bas inversent leur ordre.
        line = board[index][:] if direction in ('left', 'right') else [board[y][index] for y in range(4)]
        reverse = direction in ('right', 'down')
        if reverse:
            line.reverse()
        merged, points = merge_line(line)
        if reverse:
            merged.reverse()
        total += points
        for position in range(4):
            if direction in ('left', 'right'):
                result[index][position] = merged[position]
            else:
                result[position][index] = merged[position]
    return result, total, result != board


def has_moves(board):
    """Une case vide ou deux voisines égales permettent encore de jouer."""
    for y in range(4):
        for x in range(4):
            value = board[y][x]
            if not value:
                return True
            if x < 3 and value == board[y][x + 1]:
                return True
            if y < 3 and value == board[y + 1][x]:
                return True
    return False


class Game2048:
    """État de partie : grille, score, nombre de coups et générateur aléatoire."""
    def __init__(self, rng=None):
        self.rng = rng if rng is not None else random.Random()
        self.reset()

    def reset(self):
        self.board = [[0] * 4 for _ in range(4)]
        self.score = self.turns = 0
        self.spawn()
        self.spawn()

    def spawn(self):
        empty = [(y, x) for y in range(4) for x in range(4) if not self.board[y][x]]
        if empty:
            y, x = self.rng.choice(empty)
            self.board[y][x] = 2 if self.rng.random() < 0.9 else 4

    def move(self, direction):
        board, points, changed = move_board(self.board, direction)
        if changed:
            self.board = board
            self.score += points
            self.turns += 1
            self.spawn()  # Aucun ajout si le déplacement n’a rien changé.
        return changed, points

    @property
    def won(self):
        return any(value >= 2048 for row in self.board for value in row)

    @property
    def over(self):
        return not has_moves(self.board)
