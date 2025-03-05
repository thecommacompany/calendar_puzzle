<script setup lang="ts">

const piece = defineModel('piece',{
  type: Object,
})

const cellSize: number = 40

// Function to determine which gradient to use based on piece ID
const getPieceGradient = (pieceId: number): string => {
  const gradientClasses: string[] = [
    'bg-gradient-to-br from-[#FF6B6B] to-[#EE5253]',     // Coral Red
    'bg-gradient-to-br from-[#A3CB38] to-[#C4E538]',     // Fresh Green
    'bg-gradient-to-br from-[#FDA7DF] to-[#D980FA]',     // Lavender Pink
    'bg-gradient-to-br from-[#FFA502] to-[#FF9F1A]',     // Orange
    'bg-gradient-to-br from-[#9B59B6] to-[#8E44AD]',     // Royal Purple
    'bg-gradient-to-br from-[#FF9FF3] to-[#F368E0]',     // Soft Pink
    'bg-gradient-to-br from-[#20BF6B] to-[#0FB9B1]',     // Turquoise
    'bg-gradient-to-br from-[#F97F51] to-[#EB4D4B]',     // Reddish Orange
    'bg-gradient-to-br from-[#45AAF2] to-[#2D98DA]',     // Sky Blue
    'bg-gradient-to-br from-[#F8C291] to-[#F6B93B]'      // Golden
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
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.piece-cell {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0.5px;
}

.piece-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  border-radius: 4px;
}

.piece-grid:active {
  cursor: grabbing;
}

.piece-grid.dragging {
  opacity: 0.9;
}
</style>