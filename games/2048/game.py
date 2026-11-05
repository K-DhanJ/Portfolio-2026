"""Interface du 2048 écrite en Python et exécutée par Brython.

Seul ce module connaît le navigateur. engine.py reste du Python standard.
"""
from browser import document, html, window
from engine import Game2048

english = 'lang=en' in str(window.location.search)
def t(fr, en):
    return en if english else fr

game = Game2048()
root = document['game']
root.clear()
try:
    best = max(0, int(window.localStorage.getItem('kevidu-2048-best') or 0))
except Exception:
    best = 0  # Le jeu fonctionne aussi si le stockage local est désactivé.

header = html.DIV(Class='game-header')
header <= html.DIV(html.P(t('PYTHON DANS LE NAVIGATEUR', 'PYTHON IN THE BROWSER'), Class='eyebrow') + html.H2(t('À vous de jouer.', 'Your turn to play.')))
restart = html.BUTTON(t('Nouvelle partie', 'New game'), type='button', Class='restart')
header <= restart
root <= header
stats = html.DIV(Class='stats')
score_label = html.STRONG('0')
best_label = html.STRONG(str(best))
turn_label = html.STRONG('0')
for label, counter in [('Score', score_label), (t('Record local', 'Local best'), best_label), (t('Coups', 'Moves'), turn_label)]:
    stats <= html.DIV(html.SPAN(label) + counter)
root <= stats
instructions = html.P(t('Fusionnez les tuiles de même valeur pour atteindre 2048. Cliquez sur la grille, puis utilisez les flèches, les boutons ou un glissement.', 'Merge equal tiles to reach 2048. Focus the board, then use arrow keys, buttons or a swipe.'), id='instructions', Class='instructions')
root <= instructions
board = html.DIV(Class='board', tabindex='0', role='grid')
board.attrs['aria-label'] = t('Grille de jeu 2048, quatre lignes et quatre colonnes', '2048 game board, four rows and four columns')
board.attrs['aria-describedby'] = 'instructions'
root <= board
status = html.P('', Class='status', role='status')
root <= status
controls = html.DIV(Class='directions', role='group')
controls.attrs['aria-label'] = t('Déplacements', 'Movement controls')
for direction, symbol, label in [('up', '↑', t('Haut', 'Up')), ('left', '←', t('Gauche', 'Left')), ('down', '↓', t('Bas', 'Down')), ('right', '→', t('Droite', 'Right'))]:
    button = html.BUTTON(symbol, type='button', Class='direction ' + direction)
    button.attrs['aria-label'] = t('Déplacer vers ', 'Move ') + label.lower()
    button.bind('click', lambda event, d=direction: play(d))
    controls <= button
root <= controls
root <= html.P(t('Le record reste enregistré uniquement dans ce navigateur. Une nouvelle tuile apparaît après chaque déplacement valide.', 'Your best score is saved only in this browser. A new tile appears after each valid move.'), Class='note')


def draw(message=''):
    """Reconstruire les seize cases sans enlever le focus de la grille."""
    global best
    board.clear()
    for y in range(4):
        row = html.DIV(Class='row', role='row')
        for x in range(4):
            value = game.board[y][x]
            cell = html.DIV(str(value) if value else '', Class='cell', role='gridcell')
            cell.attrs['data-value'] = str(value)
            cell.attrs['aria-label'] = (f'Row {y+1}, column {x+1}: {value if value else "empty"}' if english else f'Ligne {y+1}, colonne {x+1} : {value if value else "vide"}')
            if value > 2048:
                cell.classList.add('high-value')
            row <= cell
        board <= row
    score_label.text = str(game.score)
    turn_label.text = str(game.turns)
    if game.score > best:
        best = game.score
        try:
            window.localStorage.setItem('kevidu-2048-best', str(best))
        except Exception:
            pass
    best_label.text = str(best)
    if game.over:
        status.text = t('Partie terminée : aucun déplacement possible. Lancez une nouvelle partie.', 'Game over: no moves left. Start a new game.')
    elif game.won:
        status.text = t('2048 atteint ! Vous pouvez continuer à jouer ou recommencer.', '2048 reached! You can keep playing or start again.')
    else:
        status.text = message or t('Objectif : 2048. À vous de jouer !', 'Goal: 2048. Your turn!')


def play(direction):
    if game.over:
        draw()
        return
    changed, points = game.move(direction)
    message = f'+{points} points · score {game.score}.' if points else t('Déplacement effectué.', 'Move completed.')
    draw(message if changed else t('Ce déplacement ne change pas la grille. Essayez une autre direction.', 'That move does not change the board. Try another direction.'))


def new_game(event):
    game.reset()
    draw(t('Nouvelle partie prête. Deux tuiles sur la grille.', 'New game ready. Two tiles on the board.'))
    board.focus()


def keydown(event):
    directions = {'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right'}
    if event.key in directions:
        event.preventDefault()
        play(directions[event.key])


# Un seul geste est pris en compte par glissement. La capture du pointeur
# garantit la réception du relâchement, même s’il sort de la grille.
swipe = None


def pointer_down(event):
    global swipe
    if event.button != 0 or not event.isPrimary:
        return
    swipe = (event.clientX, event.clientY, event.pointerId)
    board.setPointerCapture(event.pointerId)
    board.focus()


def pointer_up(event):
    global swipe
    if swipe is None or swipe[2] != event.pointerId:
        return
    dx, dy = event.clientX - swipe[0], event.clientY - swipe[1]
    swipe = None
    if max(abs(dx), abs(dy)) < 24:
        return
    play(('right' if dx > 0 else 'left') if abs(dx) > abs(dy) else ('down' if dy > 0 else 'up'))


def cancel_swipe(event):
    global swipe
    swipe = None


restart.bind('click', new_game)
board.bind('keydown', keydown)
board.bind('pointerdown', pointer_down)
board.bind('pointerup', pointer_up)
board.bind('pointercancel', cancel_swipe)
board.bind('lostpointercapture', cancel_swipe)
draw(t('Deux tuiles pour commencer. Choisissez une direction.', 'Two tiles to start. Choose a direction.'))
