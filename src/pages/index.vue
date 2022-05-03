<script setup lang="ts">

interface BlockState {
  x: number // 坐标 X
  y: number // 坐标 Y
  revealed?: boolean // 是否翻开
  mine?: boolean // 是否炸弹
  flagged?: boolean // 是否被标记
  adjacentMines?: number // 附近炸弹数
}

const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, x) =>
    Array.from({ length: WIDTH },
      (_, y): BlockState => ({ x, y })
    )
  )
)

/**
 * 计算生成炸弹
 */
function generateMines() {
  for (const row of state) {
    for (const block of row) {
      block.mine = Math.random() < 0.1
    }
  }
}
generateMines()

/**
 * 点击翻牌
 * @param {Number} row 点击行下标
 * @param {Number} col 点击列下标
 */
function onClick(row: number, col: number) {
  console.log(row, col);
}
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, x) in state">
      <button v-for="(item, y) in row" w-10 h-10 border hover:bg-gray @click="onClick(x, y)">
        {{ item.mine ? 'X' : '-' }}
      </button>
    </div>
  </div>
</template>
