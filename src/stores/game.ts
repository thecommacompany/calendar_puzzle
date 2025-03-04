import { defineStore } from 'pinia'

interface Cell {
  id: number
  x: number | undefined
  y: number | undefined
  type: string
  value: string
  rowIndex: number
  colIndex: number
  width: number | undefined
  height: number | undefined
  isOccupied: boolean
  pieceId: number | null
}

interface Piece {
  id: number
  shape: number[][]
  anchorCell?: number
}

function findOccupiedCells(pieceShapeMatrix: number[][], boardState: Cell[], anchorCell: {rowIndex: number, colIndex: number}): Cell[] {
    console.log('PieceShape', pieceShapeMatrix)
    const occupiedCells: Cell[] = [];
    const boardCols = 9
    
    pieceShapeMatrix.forEach((row: number[], RowIndex: number) => {
        row.forEach((col: number, ColIndex: number) => {
            if(col === 1) {
                const newIndex = [anchorCell.rowIndex + RowIndex, anchorCell.colIndex + ColIndex]
                const cell = boardState.find(cell => cell.id === newIndex[0] * boardCols + newIndex[1] + 1)
                if(cell) occupiedCells.push(cell)
            }
        })
    })
    return occupiedCells
}

export const useGameStore = defineStore('game', {
  state: () => ({
    initBoardState: [] as Cell[],
    boardState: [] as Cell[],
  }),
  
  getters: {
    getboardState: (state) => state.boardState
  },
  
  actions: {
    setboardState(boardState: Cell[]) {
      this.initBoardState = JSON.parse(JSON.stringify(boardState))
      this.boardState = JSON.parse(JSON.stringify(boardState))
    },
    
    canPlay(piece: Piece, startingCellId: number): boolean {
      const anchorCell = this.boardState.find(cell => cell.id === startingCellId)
      if (!anchorCell) return false
      
      const occupiedCells = findOccupiedCells(piece.shape, this.boardState, anchorCell)
      console.log('occupiedCells', occupiedCells)
      
      for (const cell of occupiedCells) {
        if (cell.isOccupied === true || cell.type === 'blocked') {
          return false
        }
      }
      
      return true
    },
    
    placePiece(piece: Piece, startingCellId: number): void {
      const anchorCell = this.boardState.find(cell => cell.id === startingCellId)
      if (!anchorCell) return
      
      const affectedCells = findOccupiedCells(piece.shape, this.boardState, anchorCell)
      
      affectedCells.forEach(cell => {
        cell.isOccupied = true
        cell.pieceId = piece.id
      })
    },
    
    removePiece(piece: Piece): void {
      const anchorCell = this.boardState.find(cell => cell.id === piece.anchorCell)
      if (!anchorCell) return
      
      const affectedCells = findOccupiedCells(piece.shape, this.boardState, anchorCell)
      
      affectedCells.forEach(cell => {
        cell.isOccupied = false
        cell.pieceId = null
      })
    },
    
    checkWinner(solveDate: string | Date): boolean {
      const dt = new Date(solveDate)
      const day = dt.getDay()
      const month = dt.getMonth() 
      const date = dt.getDate()
      const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      const monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      
      const unOccupiedCells = this.boardState.filter(cell => cell.isOccupied === false && cell.type !== 'blocked')
      if(unOccupiedCells.length > 2) {
        const selectedDay = unOccupiedCells.find(cell => cell.type === 'day')
        const selectedMonth = unOccupiedCells.find(cell => cell.type === 'month')
        const selectedDate = unOccupiedCells.find(cell => cell.type === 'date')
        
        if(selectedDay?.value && selectedMonth?.value && selectedDate?.value) {
          console.log('selectedDay', selectedDay.value, 'selectedMonth', selectedMonth.value, 'selectedDate', selectedDate.value, dayName[day], monthName[month], date)
          if(selectedDay.value === dayName[day] && selectedMonth.value === monthName[month] && selectedDate.value === date.toString()) {
            return true
          }
        }
      }
      return false
    },
    
    resetGame(): void {
      this.boardState = JSON.parse(JSON.stringify(this.initBoardState))
    }
  }
})