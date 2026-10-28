"""Interface du 2048 écrite en Python et exécutée par Brython.

Seul ce module connaît le navigateur. engine.py reste du Python standard.
"""
from browser import document, html, window
from engine import Game2048

game = Game2048()
root = document['game']
root.clear()
try:
    best = max(0, int(window.localStorage.getItem('kevidu-2048-best') or 0))
except Exception:
    best = 0  # Le jeu fonctionne aussi si le stockage local est désactivé.

header = html.DIV(Class='game-header')
header <= html.DIV(html.P('PYTHON DANS LE NAVIGATEUR', Class='eyebrow') + html.H2('À vous de jouer.'))
restart = html.BUTTON('Nouvelle partie', type='button', Class='restart')
header <= restart
root <= header
stats = html.DIV(Class='stats')
score_label = html.STRONG('0')
best_label = html.STRONG(str(best))
turn_label = html.STRONG('0')
for label, counter in [('Score', score_label), ('Record local', best_label), ('Coups', turn_label)]:
    stats <= html.DIV(html.SPAN(label) + counter)
root <= stats
instructions = html.P('Fusionnez les tuiles de même valeur pour atteindre 2048. Cliquez sur la grille, puis utilisez les flèches, les boutons ou un glissement.', id='instructions', Class='instructions')
root <= instructions
board = html.DIV(Class='board', tabindex='0', role='grid')
board.attrs['aria-label'] = 'Grille de jeu 2048, quatre lignes et quatre colonnes'
board.attrs['aria-describedby'] = 'instructions'
root <= board
status = html.P('', Class='status', role='status')
root <= status
controls = html.DIV(Class='directions', role='group')
controls.attrs['aria-label'] = 'Déplacements'
for direction, symbol, label in [('up', '↑', 'Haut'), ('left', '←', 'Gauche'), ('down', '↓', 'Bas'), ('right', '→', 'Droite')]:
    button = html.BUTTON(symbol, type='button', Class='direction ' + direction)
    button.attrs['aria-label'] = 'Déplacer vers ' + label.lower()
    button.bind('click', lambda event, d=direction: play(d))
    controls <= button
root <= controls
root <= html.P('Le record reste enregistré uniquement dans ce navigateur. Une nouvelle tuile apparaît après chaque déplacement valide.', Class='note')


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
            cell.attrs['aria-label'] = f'Ligne {y+1}, colonne {x+1} : {value if value else "vide"}'
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
        status.text = 'Partie terminée : aucun déplacement possible. Lancez une nouvelle partie.'
    elif game.won:
        status.text = '2048 atteint ! Vous pouvez continuer à jouer ou recommencer.'
    else:
        status.text = message or 'Objectif : 2048. À vous de jouer !'


def play(direction):
    if game.over:
        draw()
        return
    changed, points = game.move(direction)
    message = f'+{points} points · score {game.score}.' if points else 'Déplacement effectué.'
    draw(message if changed else 'Ce déplacement ne change pas la grille. Essayez une autre direction.')


def new_game(event):
    game.reset()
    draw('Nouvelle partie prête. Deux tuiles sur la grille.')
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
draw('Deux tuiles pour commencer. Choisissez une direction.')
