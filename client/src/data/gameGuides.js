export const gameGuides = {
  'rubiks-cube': {
    title: "The Complete Guide to the 3D Rubik's Cube",
    intro: "This browser cube is a hands-on 3D puzzle: orbit the cube, turn any of its six faces, scramble it, and practice restoring the solved pattern. Every face move changes the sticker positions, so the puzzle keeps its state while you experiment. Your turn count and best solve are saved in this browser.",
    sections: [
      { title: 'The Rules of the Cube', paragraphs: ["The cube has six faces—Up (U), Right (R), Front (F), Down (D), Left (L), and Back (B)—and each face contains nine colored stickers. A turn rotates one complete outer layer by a quarter turn. The stickers on that layer move together, including the edge and corner stickers that connect to neighboring faces.", "A clockwise turn is shown by the face letter. A counterclockwise turn is marked with a prime symbol, such as R′. Turns can be undone one at a time. Scramble applies a sequence of 20 random face turns; Reset immediately restores the solved arrangement and clears the current turn count."] },
      { title: 'How to Play', paragraphs: ["Choose a face and turn direction from the control row. Try a few turns and orbit the cube to see how a move affects the other sides. Select Scramble when you are ready for a challenge. Work through the scrambled pattern, use Undo if you make a move by mistake, and compare your turn count with your saved best solve.", "Reset is a fresh start: it restores the original solved pattern directly. It does not calculate or animate a solution for the current scramble."] },
      { title: 'Controls', paragraphs: ["Drag across the cube area to orbit the 3D view without changing the puzzle. Use the U, R, F, D, L, and B controls for clockwise turns; use the matching prime control for counterclockwise turns. On a physical keyboard, press U, R, F, D, L, or B. Hold Shift with a face key to turn it counterclockwise. The on-screen controls also work on touch screens."] },
      { title: 'Tips for a Better Solve', paragraphs: ["Keep the cube orientation steady while learning what each face move does. Watch the edge and corner pieces next to the face you turn, not just the center stickers. If the pattern gets confusing, Undo turns one move at a time; use Reset when you want to begin again from a solved cube."] },
    ],
  },
  'cyber-pong': {
    title: 'The Complete Guide to Cyber Pong',
    intro: 'Cyber Pong is a fast paddle match against a computer opponent. Keep the glowing ball in play, return the bot’s shots, and be the first player to score seven points. Choose a difficulty before the serve, then use mouse, touch, or keyboard controls to position your paddle.',
    sections: [
      { title: 'The Rules of Cyber Pong', paragraphs: ["The match begins when you select Start Match. The ball travels across the arena and bounces off the top and bottom walls. When it reaches a paddle, it returns to the other side. A point goes to the opponent whenever the ball passes the paddle without being returned. The first side to seven points wins.", "The bot adjusts its paddle to follow the ball. Easy gives you more room to return shots, Normal offers a balanced rally, and Expert tracks the ball more quickly. A new match resets the score and serves a fresh ball."] },
      { title: 'How to Play', paragraphs: ["Move your paddle up and down to line its center up with the ball. Try to meet the ball before it reaches the edge of your side. A return can change the ball’s angle based on where it hits your paddle, so move early and avoid following the ball too late.", "Use the pause overlay or Space to pause and resume a live match. After a player reaches seven points, choose Play Rematch to start over."] },
      { title: 'Controls', paragraphs: ["Move the pointer over the arena to position your paddle. On a touch screen, drag inside the arena or use the up and down buttons below it. The Up and Down arrow keys or W and S also move your paddle. Press Space to pause or resume the current match."] },
      { title: 'Tips for Winning', paragraphs: ["Stay near the ball’s expected path instead of moving in large last-second jumps. Watch the angle after each return and keep your paddle near the middle when the ball is traveling away from you. Start on Easy to learn the rally, then raise the difficulty when you can consistently return shots."] },
    ],
  },
  'memory-flip': {
    title: 'The Complete Guide to Memory Flip',
    intro: 'Memory Flip is a timed matching game that challenges you to remember where each symbol is hidden. Turn over two cards at a time, find every matching pair, and try to finish in fewer moves. Three board sizes let you choose a quick round or a tougher memory workout.',
    sections: [
      { title: 'The Rules of Memory Flip', paragraphs: ["Every board contains two copies of each symbol. Select a hidden card to reveal it, then select a second card. A matching pair stays face up. If the symbols differ, both cards turn face down after a short pause so you can remember their locations.", "A move is counted when you reveal the second card in a pair attempt. The timer starts with your first card and stops when all pairs have been found. Quick has six pairs, Classic has eight, and Expert has ten. Your best move count is stored on this device."] },
      { title: 'How to Play', paragraphs: ["Choose Quick, Classic, or Expert before starting. Reveal a card and pay attention to its symbol and position. Continue uncovering pairs until the board is cleared. Use New Game to shuffle the cards and start another round; changing the board size also begins a fresh game."] },
      { title: 'Controls', paragraphs: ["Click or tap a card to flip it. While two unmatched cards are visible, the board waits for them to turn back before accepting another pair selection. Matched cards are locked in place and cannot be selected again."] },
      { title: 'Tips for Finding Pairs', paragraphs: ["Scan the board row by row and make a mental map of revealed symbols. When a mismatch appears, remember both positions before the cards turn back. Start with Quick to learn the layout, then use Classic or Expert to practice remembering more locations at once."] },
    ],
  },
  'reflex-test': {
    title: 'The Complete Guide to the Reflex Speed Test',
    intro: 'The Reflex Speed Test measures how quickly you react to a visual signal. Each session contains five rounds. Wait for the panel to turn green, tap as quickly as you can, and compare your average response time with your personal best.',
    sections: [
      { title: 'The Rules of the Reflex Test', paragraphs: ["Start a session and the signal panel will wait for a random interval before turning green. Tapping before the green signal counts as a false start, so wait until the color changes. Once the signal appears, the time between the change and your tap is recorded in milliseconds.", "Complete five rounds to see your average reaction time. A lower average is better. Your best five-round average is saved in this browser, and the panel shows each completed round as you progress."] },
      { title: 'How to Play', paragraphs: ["Tap the panel to begin. Keep your pointer ready while it shows the waiting state. As soon as the panel turns green, tap it once. Repeat until all five results are recorded. If you tap too early, select the panel again to restart the test."] },
      { title: 'Controls', paragraphs: ["Tap or click anywhere inside the large test panel. The same control works with a mouse or a touch screen. Use Restart above the panel to clear the current session and begin again."] },
      { title: 'Tips for Consistent Results', paragraphs: ["Keep your finger or pointer close to the panel and focus on the color change. Avoid tapping during the waiting phase. Try several sessions and compare the five-round averages rather than judging your speed from one unusually fast or slow result."] },
    ],
  },
  'color-matrix': {
    title: 'The Complete Guide to Color Matrix',
    intro: 'Color Matrix is a Simon-style sequence game. Watch the four colored pads light up, then repeat the pattern in the same order. Each successful round adds one more color, testing how well you can focus and remember a growing sequence.',
    sections: [
      { title: 'The Rules of Color Matrix', paragraphs: ["Start a game to see the first color cue. After the display finishes, the pads accept your input. Tap the colors in the exact order shown. A correct sequence advances to the next level and adds a new color. One incorrect choice ends the run.", "The level counter shows how many cues are in the current pattern. Your best completed level is saved locally. The sound button turns the short color tones on or off; the visual sequence remains available either way."] },
      { title: 'How to Play', paragraphs: ["Select Start Game and watch every pad light up. Wait until the cue sequence is finished and the center indicates Your Turn. Repeat the sequence by tapping each pad once in order. Continue through longer patterns, or choose Play Again after a mistake to begin a new run."] },
      { title: 'Controls', paragraphs: ["Tap or click one of the four colored pads. Inputs are accepted only during Your Turn, so taps during the demonstration are ignored. Toggle the speaker control to enable or mute the optional sound cues."] },
      { title: 'Tips for Remembering the Pattern', paragraphs: ["Name each color to yourself as it flashes, or remember a short rhythm such as red–blue–green. Focus on the full sequence before entering it; the game adds to the previous pattern rather than replacing it. If you lose track, restart and build your recall one level at a time."] },
    ],
  },
  wordle: {
    title: 'The Complete Guide to Wordle Daily',
    intro: 'Wordle Daily is a once-a-day five-letter word puzzle. Find the hidden word in six guesses or fewer. After each guess, colored tiles show which letters are in the answer and whether they are in the correct position. Your progress for the day stays saved in this browser.',
    sections: [
      { title: 'The Rules of Wordle', paragraphs: ["Enter a valid five-letter word and submit it. Green means the letter is correct and in the right place. Yellow means the letter is in the answer but belongs in another position. Gray means that letter is not used in an unmatched position in the answer. The game accounts for repeated letters when coloring the tiles.", "You have six guesses. A new word is selected each day; resetting the page does not change that day’s answer. The accepted word list is built into the game, so an entry outside that list will be rejected without using a guess."] },
      { title: 'How to Play', paragraphs: ["Type five letters using your keyboard or the on-screen keys, then press Enter or Guess. Read the colors in the submitted row and use them to narrow down the next word. Backspace or DEL removes the last letter before submission. The puzzle ends when you find the word or use all six guesses.", "Use Share Result after the puzzle ends to copy a color-grid summary. Your submitted guesses are saved for the current day, so you can leave and return without losing progress."] },
      { title: 'Controls', paragraphs: ["Use letter keys to enter a guess, Enter to submit, and Backspace to delete a letter. On the on-screen keyboard, tap letters to type, ENTER to submit, and DEL to erase. A guess must contain exactly five letters and be in the game’s accepted word list."] },
      { title: 'Tips for Solving the Daily Word', paragraphs: ["Begin with a word that tests several common letters. Keep green letters fixed in their positions and move yellow letters to new positions. Avoid reusing gray letters unless the feedback showed another copy of that letter may be present. Use each guess to test likely letters while respecting all the clues you have collected."] },
    ],
  },
  '2048': {
    title: 'The Complete Guide to the 2048 Puzzle',
    intro: '2048 is a sliding-number puzzle played on a four-by-four board. Combine equal tiles to build larger numbers, raise your score, and reach the 2048 tile. The board continues after you reach the target, so you can keep playing for a higher score.',
    sections: [
      { title: 'The Rules of 2048', paragraphs: ["Move every tile in one direction at a time. Tiles with the same value combine when they meet, producing a tile twice as large; for example, two 16 tiles make a 32. A tile can merge only once during a single move. After a move that changes the board, a new 2 or 4 appears in an empty cell.", "The score increases by the value created by each merge, and the best score is saved in this browser. A move that would leave the board unchanged does not add a tile. The game ends when no empty cells or matching neighbors remain. Reaching 2048 shows a choice to keep playing or start a new board."] },
      { title: 'How to Play', paragraphs: ["Choose a direction to slide the board. Plan each move around the largest tiles and the empty spaces they need. Use Undo to restore the board and score from the previous changed move. New Game resets the board, current score, and undo history while preserving your saved best score."] },
      { title: 'Controls', paragraphs: ["Use the arrow keys or W, A, S, and D on a keyboard. On phones and tablets, swipe in the direction you want to move or tap one of the four arrow buttons. You can also use the buttons with a mouse."] },
      { title: 'Strategy Tips', paragraphs: ["Keep your largest tile in one corner and organize the next-largest tiles along the same edge. Avoid moving in a direction that breaks this order unless the board is blocked. Preserve open cells so a new tile can appear, and look several moves ahead before you combine a chain of matching values."] },
    ],
  },
  'tic-tac-toe': {
    title: 'The Complete Guide to the AI Tic-Tac-Toe Arena',
    intro: 'Tic-Tac-Toe brings the classic three-by-three grid to your browser. Play X against an AI opponent at Easy or Expert difficulty, or switch to local two-player mode and share the screen with a friend. The game tracks the score across rounds until you reset the match.',
    sections: [
      { title: 'The Rules of Tic-Tac-Toe', paragraphs: ["The board has nine cells. X moves first and O moves second. Players alternate turns by selecting an empty cell. The first player to complete three marks in a horizontal row, vertical column, or diagonal wins that round. If all nine cells are filled without a winning line, the round is a draw.", "In AI mode, you play X and the computer plays O. Easy may choose a weaker move; Expert uses minimax and will not lose when it plays correctly. In two-player mode, two people take alternating turns on the same board. The score above the board records wins for X and O and the number of draws. New Round clears only the board; Reset Match clears the scores as well."] },
      { title: 'How to Play', paragraphs: ["Choose an empty square when it is your turn. In AI mode, the computer responds after a short pause. Use the AI level menu to switch between Easy and Expert. Select 2 Players to play locally, or Play AI to return to computer mode. When a round ends, choose Next Round to keep the match score or Reset Match to start the score over."] },
      { title: 'Controls', paragraphs: ["Click or tap an empty square to place your mark. In AI mode, the board locks while the computer is choosing its move and after a round is finished. Select New Round to replay without changing the match mode or score."] },
      { title: 'Strategy Tips', paragraphs: ["If you can complete a line on your next move, take the win. Otherwise, block an opponent who is one move from winning. Creating two separate threats can force a useful response. The center participates in four winning lines, and corners participate in three, so they are strong early choices when they do not leave an immediate threat unblocked."] },
    ],
  },
  snake: {
    title: 'The Complete Guide to Cyber Snake',
    intro: 'Cyber Snake is a classic arcade survival game on an 18-by-18 grid. Guide the glowing snake to collect fruit, grow longer, and build your score. Avoid the arena walls and your own tail, which becomes harder as the snake grows and the pace increases.',
    sections: [
      { title: 'The Rules of Cyber Snake', paragraphs: ["Each fruit increases your apple score and lengthens the snake by one segment. The snake moves continuously in its current direction. Hitting a wall or running into the snake’s body ends the run. The board does not wrap around at the edges.", "Choose Calm, Normal, or Fast to set the movement speed. Your best apple count is saved in this browser. Space pauses or resumes a live game. Restart begins a new run with the selected speed."] },
      { title: 'How to Play', paragraphs: ["Select Start Game and steer toward the glowing fruit. Plan turns before reaching a corner and leave enough open space to navigate around your growing tail. If you need a break, pause the game. After a collision, choose Play Again to reset your score and begin another run."] },
      { title: 'Controls', paragraphs: ["Use the arrow keys or W, A, S, and D to change direction. Press Space to pause or resume. On a touch screen, swipe across the board or use the four direction buttons beneath it. The snake cannot reverse directly into itself, so choose a perpendicular or forward direction instead."] },
      { title: 'Tips for a Longer Run', paragraphs: ["Collect fruit without trapping the head between the wall and the body. Wide loops are safer than tight turns when the snake gets long. Keep moving toward open space and think about where the tail will be after your next few steps. Start with Calm to learn the board, then increase the speed for a greater challenge."] },
    ],
  },
  'typing-race': {
    title: 'The Complete Guide to the Speed Typing Race',
    intro: 'Speed Typing Race is a short, timed practice test for keyboard accuracy and speed. Type the displayed passage as it appears and watch your words per minute and accuracy update. Choose a 15-, 30-, or 60-second sprint, then try to beat your personal best.',
    sections: [
      { title: 'How the Typing Test Works', paragraphs: ["Choose a duration and select Start Typing Test. The countdown begins when the test starts. Type the passage from left to right; correct characters are highlighted in green and mismatches in red. The test ends when the timer reaches zero or when you finish the passage.", "Words per minute is calculated from correctly typed characters, using five characters as one word, divided by elapsed time. Accuracy is the share of your typed characters that match the passage at their positions. Your best WPM is stored in this browser. A new passage cycles to another practice text and resets the current attempt."] },
      { title: 'Controls', paragraphs: ["Click Start Typing Test and type in the text box. Standard keyboard editing, including Backspace, is available while the test runs. Choose 15s, 30s, or 60s before starting. Select New Passage to load a different text and return the test to its ready state. Restart clears the current attempt and starts the selected duration again."] },
      { title: 'Reading Your Results', paragraphs: ["WPM estimates how quickly you are typing; accuracy shows how often the characters match the source passage. A fast result with many errors may be less useful than a slightly slower, more accurate run. The timer display shows remaining time during a test, and the finished summary reports your WPM and accuracy."] },
      { title: 'Tips for Improving', paragraphs: ["Look a few words ahead instead of watching each key. Keep a steady rhythm and prioritize accurate keystrokes; correcting fewer mistakes usually improves your final speed. Repeat the same duration for comparable results, then try a longer sprint when you can maintain your accuracy."] },
    ],
  },
};
