<script setup lang="ts">

const piece = defineModel('piece',{
  type: Object,
})

const cellSize: number = 40

// Function to determine which gradient to use based on piece ID
const getPieceGradient = (pieceId: number): string => {
  const gradientClasses: string[] = [
    'bg-gradient-to-br from-amber-400 to-orange-500', // 1
    'bg-gradient-to-br from-rose-400 to-red-500',     // 2
    'bg-gradient-to-br from-orange-300 to-amber-600', // 3
    'bg-gradient-to-br from-amber-300 to-yellow-500', // 4
    'bg-gradient-to-br from-orange-300 to-red-400',   // 5
    'bg-gradient-to-br from-rose-300 to-amber-400',   // 6
    'bg-gradient-to-br from-amber-200 to-orange-400', // 7
    'bg-gradient-to-br from-red-300 to-amber-500',    // 8
    'bg-gradient-to-br from-orange-200 to-red-400',   // 9
    'bg-gradient-to-br from-yellow-300 to-amber-500'  // 10
  ];
  
  return gradientClasses[(pieceId - 1) % gradientClasses.length];
}
const emit = defineEmits(['rotate'])

// Long press detection for mobile rotation
let pressTimer: ReturnType<typeof setTimeout> | null = null
const longPressDelay: number = 250 // ms

const startPress = (_event: Event): void => {

  if (pressTimer === null) {
    pressTimer = setTimeout(() => {
      emit('rotate')
   
      pressTimer = null
    }, longPressDelay)
  }
}

const cancelPress = (): void => {
  if (pressTimer !== null) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}
</script>

<template>

  <div class="piece-grid" :style="{
    transformOrigin: 'center'
  }"  @touchstart="startPress"
  @touchend="cancelPress"
  @touchmove="cancelPress"
>
    <div 
      v-for="(row, rowIndex) in piece.shape"  >
      <div v-for="(cell, colIndex) in row" >
     <div v-if="cell === 1"
      class="piece-cell"
      :class="getPieceGradient(piece.id)"
      :style="{ 
        top: `${rowIndex * cellSize}px`, 
        left: `${colIndex * cellSize}px` 
      }"
    >
    </div>
    </div>
  </div>
 </div>
</template>
<style>
.piece-grid {
  position: relative;
  /* The exact size will be calculated dynamically */
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}
.piece-cell {
  position: absolute;
  width: 40px; /* Match your board cell size */
  height: 40px; /* Match your board cell size */
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.piece-cell:hover {
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
</style>