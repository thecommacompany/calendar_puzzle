<script setup lang="ts">
import { useTemplateRef, ref, onMounted, computed } from 'vue';
import { useGameStore } from './stores/game';
import interact from 'interactjs';
import BoardMain from './components/BoardMain.vue'
import PuzzlePiece from './components/PuzzlePiece.vue';
import { Howl, Howler } from 'howler';

interface PuzzlePiece {
  id: number;
  shape: number[][];
  initPosition: { x: number; y: number };
  position: { x: number; y: number };
  rotation: number;
  placed: boolean;
  scale: number;
  anchorCell?: number;
}

interface BoardCell {
  id: number;
  x: number;
  y: number;
}

const gameara = useTemplateRef<HTMLDivElement>('gamearea')
// const boardRef = useTemplateRef<HTMLDivElement>('board')

const soundEnabled = ref(true);
const showHelp = ref(false);
const showWinModal = ref(false);
const isLoading = ref(true);
const soundsReady = ref(false);
const gameStarted = ref(false);

// Sound effects
const sounds = {
  ambient: new Howl({
    src: ['/sounds/ambient.mp3'],
    loop: true,
    volume: 0.3,
    onload: () => checkAllSoundsLoaded(),
  }),
  win: new Howl({
    src: ['/sounds/win.mp3'],
    volume: 0.8,
    onload: () => checkAllSoundsLoaded(),
  }),
  woodDrop: new Howl({
    src: ['/sounds/wood_drop.mp3'],
    volume: 0.3,
    onload: () => checkAllSoundsLoaded(),
  }),
  woodFail: new Howl({
    src: ['/sounds/wood_fail.mp3'],
    volume: 0.6,
    onload: () => checkAllSoundsLoaded(),
  })
};

// Counter to track loaded sounds
let soundsLoaded = 0;
const totalSounds = Object.keys(sounds).length;

// Check if all sounds have loaded
const checkAllSoundsLoaded = () => {
  soundsLoaded++;
  if (soundsLoaded >= totalSounds) {
    isLoading.value = false;
    soundsReady.value = true;
    // We don't auto-play sounds anymore, wait for user interaction
  }
};

// Start the game after user interaction (clicking start button)
const startGame = () => {
  gameStarted.value = true;
  if (soundEnabled.value) {
    // Now we can play the ambient sound as user has interacted
    sounds.ambient.play();
  }
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  if (soundEnabled.value) {
    sounds.ambient.play();
  } else {
    Howler.mute(true);
    sounds.ambient.pause();
    Howler.mute(false);
  }
};

const toggleHelp = () => {
  showHelp.value = !showHelp.value;
};

const toggleWinModal = () => {
  showWinModal.value = !showWinModal.value
}

const gameStore = useGameStore()

// define pieces

const puzzlePieces = ref<PuzzlePiece[]>([
  {
    id:1,
    shape:[
      [1,1,1,1,1]
    ],
    initPosition:{x:10,y:100},
    position:{x:10,y:100},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:2,
    shape:[
      [1,1,1],
      [0,1,0],
      [0,1,0]
    ],
    initPosition:{x:120,y:100},
    position:{x:120,y:100},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:3,
    shape:[
      [0,0,1],
      [1,1,1],
      [1,0,0]
    ],
    initPosition:{x:200,y:100},
    position:{x:200,y:100},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:4,
    shape:[
      [1,1,1,1],
      [1,0,0,0],
    ],
    initPosition:{x:290,y:100},
    position:{x:290,y:100},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },{
    id:5,
    shape:[
      [0,1,1],
      [1,1,1],

    ],
    initPosition:{x:20,y:160},
    position:{x:20,y:160},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:6,
    shape:[
      [1,1,1],
      [1,0,1],

    ],
    initPosition:{x:110,y:160},
    position:{x:110,y:160},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:7,
    shape:[
      [0,0,1],
      [1,1,1],
      [0,1,0]

    ],
    initPosition:{x:200,y:160},
    position:{x:200,y:160},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:8,
    shape:[
      [0,1,1,1],
      [1,1,0,0],
    

    ],
    initPosition:{x:290,y:160},
    position:{x:290,y:160},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
    {
    id:9,
    shape:[
      [0,0,1,0],
      [1,1,1,1],
    

    ],
    initPosition:{x:20,y:220},
    position:{x:20,y:220},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  },
  {
    id:10,
    shape:[
      [1,1,1],
      [1,0,0],
      [1,0,0],
    

    ],
    initPosition:{x:110,y:220},
    position:{x:110,y:220},
    rotation:0,
    placed:false,
    scale:0.5,
    anchorCell:undefined
  }
])


onMounted(() => {
  puzzlePieces.value.forEach((piece) => {
    interact(`#piece-${piece.id}`).draggable({
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: '.gamearea',
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          endOnly: false
        })
      ],
      listeners: {
        start(event) {
          const pieceId = parseInt(event.target.getAttribute('data-id'))
          const piece = puzzlePieces.value.find(p => p.id === pieceId)
          
          if (piece) {
            event.target.style.zIndex = `100`
            piece.scale = 1
            if(piece.placed==true){
              gameStore.removePiece(piece)
              let pieceIndex = puzzlePieces.value.findIndex(p => p.id === piece.id)
              puzzlePieces.value[pieceIndex].placed = false
              puzzlePieces.value[pieceIndex].anchorCell = undefined
            }
          }
        },
        move(event) {
          const target = event.target
          const pieceId = parseInt(target.getAttribute('data-id'))
          const piece = puzzlePieces.value.find(p => p.id === pieceId)
          
          if (piece) {
            const gameareaRect = document.querySelector('.gamearea')?.getBoundingClientRect()
            const pieceRect = target.getBoundingClientRect()
            
            if (gameareaRect) {
              const newX = piece.position.x + event.dx
              const newY = piece.position.y + event.dy
              
              const maxX = gameareaRect.width - pieceRect.width
              const maxY = gameareaRect.height - pieceRect.height
              
              piece.position.x = Math.min(Math.max(0, newX), maxX)
              piece.position.y = Math.min(Math.max(0, newY), maxY)
            }
          }
        },
        end(event) {
          const pieceId = parseInt(event.target.getAttribute('data-id'))
          const piece = puzzlePieces.value.find(p => p.id === pieceId)
          if (piece) {
            if (insideBoard(piece.position.x, piece.position.y)) {
              snapToNearestCell(pieceId)
              if (piece.placed == true) event.target.style.zIndex = piece.id.toString()
            } else {
              piece.scale = 0.5
            }
          }
        }
      }
    })
  })
})
const rotatePiece = (piece: PuzzlePiece) => {
  // Remove the piece from the board
  if(piece.placed==true){
    gameStore.removePiece(piece)
    piece.placed = false
    piece.scale = 0.5
  
  }

  // Create a new rotated shape matrix
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const newShape = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      newShape[j][rows - 1 - i] = piece.shape[i][j];
    }
  }
  
  piece.shape = newShape;

  piece.rotation = (piece.rotation + 90) % 360;
}

function insideBoard(x: number, y: number): boolean {
  const boardRect = document.querySelector('.board-main')?.getBoundingClientRect()
  if (!boardRect) return false
  return x >= boardRect.left && x <= boardRect.right &&
         y >= boardRect.top - 100 && y <= boardRect.bottom + 25
}
function checkAllPiecesPlaced(){
  const pieces = puzzlePieces.value
  return pieces.every(piece => piece.placed)
}

const boardCellsBounding = computed(() => gameStore.getboardState)

function snapToNearestCell(pieceId: number) {
  const pieces = puzzlePieces.value as PuzzlePiece[]
  const piece = pieces.find(p => p.id === pieceId)
  if (!piece) return
  const pieceElem = document.querySelector('#piece-' + piece.id)
  const pieceRect = pieceElem?.getBoundingClientRect()
  if (!pieceRect) return
  
  // Get piece top-left point
  const pieceX = pieceRect.x 
  const pieceY = pieceRect.y
  
  // Find nearest cell by calculating distance to each cell's top-left corner
  let nearestCell: BoardCell | null = null
  let minDistance = Infinity
  
  for (const cell of boardCellsBounding.value as BoardCell[]) {
    const cellX = cell.x
    const cellY = cell.y
    
    const distance = Math.sqrt(
      Math.pow(cellX - pieceX, 2) + 
      Math.pow(cellY - pieceY, 2)
    )
    
    // Skip cells that would make the piece go outside the board
    if (distance < minDistance) {
      // Check if piece would be completely inside the board when snapped to this cell
      if (wouldPieceFitOnBoard(piece, cellX, cellY)) {
        minDistance = distance
        nearestCell = cell
      }
    }
  }

  if (nearestCell) {
    // Snap piece to the cell's top-left position
    if(gameStore.canPlay(piece,nearestCell.id)==true) { 
      piece.position.x = nearestCell.x
      piece.position.y = nearestCell.y
      gameStore.placePiece(piece,nearestCell.id)
      let pieceIndex = puzzlePieces.value.findIndex(p => p.id === piece.id)
      puzzlePieces.value[pieceIndex].placed = true
      puzzlePieces.value[pieceIndex].anchorCell = nearestCell.id
      piece.scale = 1
      
      // Play wood drop sound when piece is placed successfully
      if (soundEnabled.value) {
        sounds.woodDrop.play();
      }
    } else {
      // shake piece
      piece.placed = false
     
      piece.scale = 0.5
      
      // Play failed placement sound
      if (soundEnabled.value) {
        sounds.woodFail.play();
      }
    }
    
  }
  if(checkAllPiecesPlaced()){
    const win = gameStore.checkWinner(dateToSolve.value)
    if(win==true){
      showWinModal.value = true
      
      // Play win sound when puzzle is completed
      if (soundEnabled.value) {
        sounds.win.play();
      }
    }
  }
}

// Function to check if a piece would fit entirely on the board when placed at a given position
function wouldPieceFitOnBoard(piece: PuzzlePiece, posX: number, posY: number): boolean {
  const cellSize = 40 // Same as defined in PuzzlePiece.vue
  
  // Get all cells on the board (as a set of coordinates for quick lookup)
  const boardCells: Set<string> = new Set()
  for (const cell of boardCellsBounding.value as BoardCell[]) {
    boardCells.add(`${Math.round(cell.x)},${Math.round(cell.y)}`)
  }
  
  // Check if each filled cell in the piece would be on a valid board cell
  for (let rowIndex = 0; rowIndex < piece.shape.length; rowIndex++) {
    for (let colIndex = 0; colIndex < piece.shape[rowIndex].length; colIndex++) {
      // Skip empty cells in the piece's shape
      if (piece.shape[rowIndex][colIndex] !== 1) continue
      
      // Calculate the expected position of this cell on the board
      const cellX = posX + (colIndex * cellSize)
      const cellY = posY + (rowIndex * cellSize)
      
      // Check if there's a valid board cell at this position
      let foundValidCell = false
      
      // We need to check with some tolerance because of potential rounding errors
      for (const cellCoord of boardCells) {
        const [boardX, boardY] = cellCoord.split(',').map(Number)
        
        // Check if the piece cell is aligned with a board cell (with tolerance)
        if (Math.abs(cellX - boardX) < 5 && Math.abs(cellY - boardY) < 5) {
          foundValidCell = true
          break
        }
      }
      
      // If we couldn't find a valid board cell for this piece cell, the piece doesn't fit
      if (!foundValidCell) {
        return false
      }
    }
  }
  
  return true // All cells of the piece are on valid board cells
}

// reset game and pieces
function resetGame(){
  gameStore.resetGame()
  puzzlePieces.value.forEach((piece) => {
    piece.position = piece.initPosition
    piece.rotation = 0
    piece.placed = false
    piece.scale = 0.5
    piece.anchorCell = undefined
  })
  // Reset and restart ambient music when game resets
  if (soundEnabled.value) {
    sounds.ambient.stop();
    sounds.ambient.play();
  }
}

// Date to Solve
const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let dateToSolve = ref(new Date().toISOString().split('T')[0])
const showDatePicker = ref(false)

const handleDateChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  dateToSolve.value = input.value
  showDatePicker.value = false
}

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
}

</script>

<template>
  
  <div class="gamearea relative h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" ref="gameara">
   <!-- Loading overlay -->
   <div v-if="!gameStarted" class="fixed inset-0 bg-amber-100 flex items-center justify-center z-50">
     <div class="text-center">
       <svg v-if="isLoading" class="animate-spin h-12 w-12 mx-auto mb-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
       </svg>
       <h1 class="text-2xl font-bold text-amber-800 mb-3">Calendar Puzzle</h1>
       <p v-if="isLoading" class="text-lg font-medium text-amber-800 mb-4">Loading sounds...</p>
       <button 
         v-if="soundsReady" 
         @click="startGame" 
         class="px-8 py-3 text-lg font-medium bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 transition-colors shadow-lg transform hover:scale-105 transition-transform duration-200"
       >
         Start Game
       </button>
     </div>
   </div>
   
   <!-- Modern Zen Nav Bar -->
   <div class="fixed w-full top-0 bg-gradient-to-r from-amber-500/90 via-orange-400/90 to-amber-500/90 backdrop-blur-md p-4 flex justify-between items-center z-20 shadow-md rounded-b-2xl">
     <div class="flex items-center">
       <h1 class="text-2xl font-medium text-white tracking-wide">Calendar Puzzle</h1>
     </div>
     <div class="flex items-center gap-3">
      
       <button @click="toggleSound" class="nav-button group">
         <span class="sr-only">Toggle Sound</span>
         <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-amber-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 9l4-4 4 4v6l-4 4-4-4V9z" />
         </svg>
         <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-amber-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
         </svg>
       </button>
       
       <button @click="resetGame" class="nav-button group" title="Reset Game">
         <span class="sr-only">Reset Game</span>
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-amber-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
         </svg>
       </button>
       
       <button @click="toggleHelp" class="nav-button group">
         <span class="sr-only">Help</span>
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-amber-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
       </button>
     </div>
   </div>

   <!-- Help Modal -->
   <div v-if="showHelp" class="fixed inset-0 flex items-center justify-center z-200">
     <div class="absolute inset-0 bg-black/50" @click="toggleHelp"></div>
     <div class="bg-white w-11/12 max-w-md p-6 rounded-2xl shadow-xl z-40 relative">
       <h2 class="text-xl font-semibold mb-4 text-amber-800">How to Play</h2>
       <ul class="list-disc pl-5 space-y-2 text-amber-700">
         <li>Drag puzzle pieces to place them on the board</li>
         <li>On mobile devices Long press a piece to rotate it</li>
         <li>Double-click a piece to rotate it</li>
         <li>All pieces must fit completely on the board</li>
         <li>Complete the puzzle by placing all pieces correctly</li>
       </ul>
   
       <button @click="toggleHelp" class="mt-6 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 transition-colors">
         Got it!
       </button>
       <div class="text-sm text-amber-700 text-center py-3">
        <div>Audio Provided by zapsplat.com</div>
        <div>Made with ❤️ by <a href="https://thecomma.co.in">The Comma Company</a></div>
       </div>
     </div>
   </div>
   
   <!-- Win Modal -->
   <div v-if="showWinModal" class="fixed inset-0 flex items-center justify-center z-200">
     <div class="absolute inset-0 bg-black/50" @click="toggleWinModal"></div>
     <div class="bg-white w-11/12 max-w-md p-6 rounded-2xl shadow-xl z-40 relative">
       <h2 class="text-2xl font-bold mb-4 text-amber-800">Congratulations!</h2>
       <p class="text-lg text-amber-700 mb-3">You solved the calendar puzzle!</p>
       <div class="flex justify-center my-4">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
       </div>
       <div class="flex justify-between mt-6">
         <button @click="toggleWinModal" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 transition-colors">
           Close
         </button>
         <button @click="resetGame(); toggleWinModal()" class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl hover:from-green-600 hover:to-emerald-500 transition-colors">
           Play Again
         </button>
       </div>
     </div>
   </div>
    <div class="board absolute left-1/2 top-1/2 md:-translate-y-1/2 -translate-x-1/2 ">
      <BoardMain class="board-main" />
    </div>
    <div 
      v-for="piece in puzzlePieces" 
      :key="piece.id" 
      :id="'piece-' + piece.id"
      :data-id="piece.id"
      class="puzzle-piece absolute touch-none z-10" 
      :style="{
        transform: `translate(${piece.position.x}px, ${piece.position.y}px) scale(${piece.scale})`,
        cursor: 'move',
        transition: 'scale 0.2s ease'
      }"

      
    >
      <PuzzlePiece :piece="piece" @dblclick="rotatePiece(piece)"  @rotate="rotatePiece(piece)"/>
     
    </div>
    <div class="fixed bottom-0 left-0 right-0 text-center text-lg p-3 z-40 text-gray-100 bg-gray-900">
      <div class="flex justify-center items-center gap-2">
        Solve: 
        <div class="relative flex items-center gap-2">
          <span class="text-amber-500 font-bold text-2xl">
            {{ new Date(dateToSolve).getDate() }} {{ dayName[new Date(dateToSolve).getDay()] }} {{ monthName[new Date(dateToSolve).getMonth()] }}
          </span>
          <button 
            @click="toggleDatePicker"
            class="text-gray-300 hover:text-amber-400 transition-colors"
            title="Pick date"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </button>
         <div  v-if="showDatePicker" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
          
        <div class="p-5 flex flex-col gap-3">
          <input 
           
           type="date" 
           :value="dateToSolve"
           @change="handleDateChange"
           class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
         />
         <div class="flex gap-3 justify-center">
          <button @click="dateToSolve=new Date().toISOString()" class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl hover:from-green-600 hover:to-emerald-500 transition-colors">Today</button>
          <button @click="showDatePicker = false" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 transition-colors">Close</button>
         </div>
        </div>
         </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gamearea {
  touch-action: none;
  user-select: none;
  border: 2px solid #ccc;
}

.puzzle-piece {
  touch-action: none;
}

.piece-wrapper {
  position: relative;
}

.rotate-btn {
  position: absolute;
  top: -25px;
  right: -25px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4a5568;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.rotate-btn:hover {
  background: #2d3748;
}

.nav-button {
  border-radius: 9999px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.nav-button:focus {
  outline: none;
}

.nav-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .nav-button svg {
    height: 1.25rem;
    width: 1.25rem;
  }

  h1 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
</style>
