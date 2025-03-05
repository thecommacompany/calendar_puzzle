
<script setup lang="ts">
import { onMounted, useTemplateRef, computed } from 'vue';
import { useGameStore } from '../stores/game';

interface BoardCell {
  id: number;
  value: string;
  type: 'month' | 'date' | 'day' | 'empty' | 'blocked';
  visible: boolean;
}

interface BoardRow {
  id: number;
  items: BoardCell[];
}

interface BoardState {
  id: number;
  x: number | undefined;
  y: number | undefined;
  type: BoardCell['type'];
  value: string;
  rowIndex: number;
  colIndex: number;
  width: number | undefined;
  height: number | undefined;
  isOccupied: boolean;
  pieceId: number | null;
}

const gameStore = useGameStore()
const boardRef = useTemplateRef<HTMLDivElement>('boardRef')

const board: BoardRow[] = [
    {
      id: 1,
      items: [
        { id: 1, value: 'JAN', type: 'month', visible: true },
        { id: 2, value: 'FEB', type: 'month', visible: true },
        { id: 3, value: 'MAR', type: 'month', visible: true },
        { id: 4, value: 'APR', type: 'month', visible: true },
        { id: 5, value: '1', type: 'date', visible: true },
        { id: 6, value: '2', type: 'date', visible: true },
        { id: 7, value: '3', type: 'date', visible: true },
        { id: 8, value: 'MON', type: 'day', visible: true },
        { id: 9, value: 'TUE', type: 'day', visible: true }
      ]
    },
    {
      id: 2,
      items: [
        { id: 10, value: 'MAY', type: 'month', visible: true },
        { id: 11, value: '4', type: 'date', visible: true },
        { id: 12, value: '5', type: 'date', visible: true },
        { id: 13, value: '6', type: 'date', visible: true },
        { id: 14, value: '7', type: 'date', visible: true },
        { id: 15, value: '8', type: 'date', visible: true },
        { id: 16, value: '9', type: 'date', visible: true },
        { id: 17, value: 'WED', type: 'day', visible: true },
        { id: 18, value: '', type: 'empty', visible: true }
      ]
    },
    {
      id: 3,
      items: [
        { id: 19, value: 'JUN', type: 'month', visible: true },
        { id: 20, value: '10', type: 'date', visible: true },
        { id: 21, value: '11', type: 'date', visible: true },
        { id: 22, value: '12', type: 'date', visible: true },
        { id: 23, value: '13', type: 'date', visible: true },
        { id: 24, value: '31', type: 'date', visible: true },
        { id: 25, value: '15', type: 'date', visible: true },
        { id: 26, value: 'THU', type: 'day', visible: true },
        { id: 27, value: '', type: 'empty', visible: true }
      ]
    },
    {
      id: 4,
      items: [
        { id: 28, value: 'JUL', type: 'month', visible: true },
        { id: 29, value: '16', type: 'date', visible: true },
        { id: 30, value: '17', type: 'date', visible: true },
        { id: 31, value: '18', type: 'date', visible: true },
        { id: 32, value: '19', type: 'date', visible: true },
        { id: 33, value: '20', type: 'date', visible: true },
        { id: 34, value: '21', type: 'date', visible: true },
        { id: 35, value: 'FRI', type: 'day', visible: true },
        { id: 36, value: 'SAT', type: 'day', visible: true }
      ]
    },
    {
      id: 5,
      items: [
        { id: 37, value: 'AUG', type: 'month', visible: true },
        { id: 38, value: '22', type: 'date', visible: true },
        { id: 39, value: '23', type: 'date', visible: true },
        { id: 40, value: '24', type: 'date', visible: true },
        { id: 41, value: '25', type: 'date', visible: true },
        { id: 42, value: '26', type: 'date', visible: true },
        { id: 43, value: '27', type: 'date', visible: true },
        { id: 44, value: '', type: 'day', visible: true },
        { id: 45, value: 'SUN', type: 'day', visible: true }
      ]
    },
    {
      id: 6,
      items: [
        { id: 46, value: 'SEP', type: 'month', visible: true },
        { id: 47, value: 'OCT', type: 'month', visible: true },
        { id: 48, value: 'NOV', type: 'month', visible: true },
        { id: 49, value: 'DEC', type: 'month', visible: true },
        { id: 50, value: '28', type: 'date', visible: true },
        { id: 51, value: '29', type: 'date', visible: true },
        { id: 52, value: '30', type: 'date', visible: true },
        { id: 53, value: '14', type: 'date', visible: true },
        { id: 54, value: '', type: 'blocked', visible: true }
      ]
    }
  ]

// calculate bounding box for each cell
let initialBoardState: BoardState[] = []

function calculateBoundingBox() {
  board.forEach((row,rowIndex) => {
    row.items.forEach((cell,colIndex) => {
      let bbox = document.getElementById(`cell-${cell.id}`)?.getBoundingClientRect()
    
      initialBoardState.push({
        id: cell.id,
        x: bbox?.x,
        y: bbox?.y,
        type: cell.type,
        value: cell.value,
        rowIndex,
        colIndex,
        width: bbox?.width, 
        height: bbox?.height,
        isOccupied: false,
        pieceId:null
      })
    })
  })
}

onMounted(() => {
  if(boardRef.value) {
    calculateBoundingBox()
    gameStore.setboardState(initialBoardState)
  }
  
})
const solveDate = defineModel<string>('solveDate')
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const parsedSolveDate = computed(() => {
  if (!solveDate.value) return null
  const date = new Date(solveDate.value)
  return {
    month: monthNames[date.getMonth()],
    day: dayNames[date.getDay()],
    date: date.getDate().toString()
  }
})

const isHighlighted = (cell: BoardCell) => {
  if (!parsedSolveDate.value) return false
  return (cell.type === 'month' && cell.value === parsedSolveDate.value.month) ||
         (cell.type === 'day' && cell.value === parsedSolveDate.value.day) ||
         (cell.type === 'date' && cell.value === parsedSolveDate.value.date)
}
</script>

<template>
 <div class="text-gray-900 text-sm">
    <div class="board-grid" ref="boardRef">
      <template v-for="row in board">
        <template v-for="cell in row.items" :key="cell.id" >
          <div v-if="cell.type=='blocked'" class="grid-cell blocked" :id="'cell-'+cell.id"></div>
          <div v-else-if="cell.type=='empty'" class="grid-cell empty" :id="'cell-'+cell.id"></div>
          <div v-else class="grid-cell" :class="[cell.type, { 'highlighted': isHighlighted(cell) }]" :id="'cell-'+cell.id">
            {{ cell.value }}
          </div>
        </template>
      </template>
    </div>
 </div>
</template>

<style scoped>
.board-grid {
  display: grid;
  grid-template-columns: repeat(9, 40px);
  grid-template-rows: repeat(6, 40px);
  gap: 0;
  background: linear-gradient(135deg, #2c5364, #203a43);
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3),
              inset 0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  border: 3px solid #1c3d4d;
  position: relative;
  isolation: isolate;
}

.board-grid::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.1),
    transparent 40%,
    rgba(255, 255, 255, 0.05) 80%
  );
  border-radius: 18px;
  z-index: 1;
  pointer-events: none;
}

.grid-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  /* border: 2px solid rgba(0, 0, 0, 0.1); */
  font-weight: 600;
  color: #495057;
  /* text-shadow: 0 1px 1px rgba(255, 255, 255, 0.7); */
  /* box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05); */
  /* transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); */
  position: relative;
  font-size: 0.775rem;
  letter-spacing: 0.02em;
  z-index: 2;
  /* border-radius: 8px; */
  /* margin: 1px; */
}

/* .grid-cell:not(.blocked):not(.empty):hover {
  transform: translateY(-1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05),
              0 4px 8px rgba(0, 0, 0, 0.1);
} */

.blocked {
  background: linear-gradient(135deg, #343a40, #212529);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(0, 0, 0, 0.2);
}

.empty {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  opacity: 0.8;
  border: 2px solid rgba(0, 0, 0, 0.05);
}

/* .month, .day {
  background: linear-gradient(135deg, #ffd43b, #fab005);
  color: #495057;
  font-weight: 700;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.1);
} */

.date {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  font-weight: 600;
  /* border: 2px solid rgba(0, 0, 0, 0.1); */
}

.highlighted {
  background: linear-gradient(135deg, #74c0fc, #4dabf7);
  border: 2px solid #FFEE88;
  color: #1c1c1c;
  box-shadow: 0 0 0 2px rgba(24, 100, 171, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 3;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(24, 100, 171, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(24, 100, 171, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }
}
</style>