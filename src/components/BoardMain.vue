
<script setup lang="ts">
import { onMounted,useTemplateRef } from 'vue';
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



</script>

<template>
 <div class="border-black border-10 text-gray-900 text-sm">
    <div class="board-grid" ref="boardRef">
      <template v-for="row in board">
        <template v-for="cell in row.items" :key="cell.id" >
          <div v-if="cell.type=='blocked'" class="grid-cell blocked" :id="'cell-'+cell.id"></div>
          <div v-else-if="cell.type=='empty'" class="grid-cell empty" :id="'cell-'+cell.id"></div>
          <div v-else class="grid-cell" :class="cell.type" :id="'cell-'+cell.id">
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
}

.grid-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.blocked {
  background-color: gray;
}

.empty {
  background-color: white;
}
</style>