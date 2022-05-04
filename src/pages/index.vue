<script setup lang="ts">
interface BlockState {
  x: number // 坐标 X
  y: number // 坐标 Y
  revealed?: boolean // 是否翻开
  mine?: boolean // 是否炸弹
  flagged?: boolean // 是否被标记
  adjacentMines: number // 附近炸弹数
}

const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, x) =>
    Array.from(
      { length: WIDTH },
      (_, y): BlockState => ({ x, y, adjacentMines: 0 })
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
 * 以自身为 0 周围八个方向坐标
 * [-1, -1] [-1, 0] [-1, 1]
 * [ 0, -1] [ 0, 0] [ 0, 1]
 * [ 1, -1] [ 1, 0] [ 1, 1]
 */
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1]
]
/**
 * 计算周围炸弹数
 */
function updateNumbers() {
  state.map((row, y) => {
    row.map((block, x) => {
      if (block.mine) return // 自身炸弹，弹出

      // 遍历周围八个方向
      directions.map(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return // 超出边界，弹出

        if (y === 1 && x === 1)
          console.log(state[y2][x2], dx, dy, state[y2][x2].mine)
        // 周围如果有炸弹，炸弹计算 +1
        if (state[y2][x2].mine) {
          block.adjacentMines += 1
        }
      })
    })
  })
}
updateNumbers()

/**
 * 点击翻牌
 * @param {Number} row 点击行下标
 * @param {Number} col 点击列下标
 */
function onClick(row: number, col: number) {
  console.log(row, col)
}

/**
 * 颜色组
 */
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500'
]
/**
 * 根据当前格状态返回样式
 * @param {Object} block 当前格数据
 */
function getBlockClass(block: BlockState) {
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}
</script>

<template>
  <div>
    Minesweeper
    <div p-5>
      <div v-for="(row, x) in state" flex="~" items-center justify-center>
        <button
          v-for="(item, y) in row"
          flex="~"
          items-center
          justify-center
          w-10
          h-10
          m="0.5"
          border="1 gray-400/10"
          hover="bg-gray/30"
          :class="getBlockClass(item)"
          @click="onClick(x, y)"
        >
          <div v-if="item.mine" i-mdi-mine></div>
          <div v-else>{{ item.adjacentMines }}</div>
        </button>
      </div>
    </div>
  </div>
</template>
