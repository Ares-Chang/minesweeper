<script setup lang="ts">
interface BlockState {
  x: number // 坐标 X
  y: number // 坐标 Y
  revealed: boolean // 是否翻开
  mine?: boolean // 是否炸弹
  flagged?: boolean // 是否被标记
  adjacentMines: number // 附近炸弹数
}

const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false })
    )
  )
)

/**
 * 计算生成炸弹
 * @param {Object} initial 初次点击格数据
 */
function generateMines(initial: BlockState) {
  for (const row of state) {
    for (const block of row) {
      // 初次点击位置上下左右一格内不生成炸弹
      if (Math.abs(initial.x - block.x) <= 1) continue
      if (Math.abs(initial.y - block.y) <= 1) continue
      block.mine = Math.random() < 0.2
    }
  }
  updateNumbers()
}

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
 * 查找周边格位信息
 * @param {Object} block 当前格数据
 * @return {Array} 返回一个包含周边格信息的数组
 */
function getSiblings(block: BlockState) {
  // 遍历周围八个方向
  return directions
    .map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return undefined // 超出边界，弹出

      return state[y2][x2]
    })
    .filter(Boolean) as BlockState[] // 过滤空信息 && 断言(ts)不会有空信息存在
}

/**
 * 计算周围炸弹数
 */
function updateNumbers() {
  state.map((row, y) => {
    row.map((block, x) => {
      if (block.mine) return // 自身炸弹，弹出

      getSiblings(block).map(item => {
        // 周围如果有炸弹，炸弹计算 +1
        if (item.mine) block.adjacentMines += 1
      })
    })
  })
}

/**
 * 清除相连的 0 字块
 * @param {Object} block 初次点击格数据
 */
function expendZero(block: BlockState) {
  if (block.adjacentMines) return // 附近有炸弹弹出

  getSiblings(block).map(item => {
    // 没翻开并且没插旗，自动翻转
    if (!item.revealed && !item.flagged) {
      item.revealed = true
      expendZero(item)
    }
  })
}

let mineGenerated = false // 游戏是否开始
const dev = true // 开发模式，可查看详情
/**
 * 点击翻牌
 * @param {Object} block 当前格数据
 */
function onClick(block: BlockState) {
  if (block.flagged) return // 如果已经插旗，不能翻转
  if (!mineGenerated) {
    // 为优化游戏体验，第一次点击完成后再生成炸弹
    generateMines(block)
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine) alert('BOOOM!')
  expendZero(block)
}

/**
 * 右键插旗
 * @param {Object} block 当前格数据
 */
function onRightClick(block: BlockState) {
  if (block.revealed) return // 如果已经展开，不能插旗
  block.flagged = !block.flagged
}

watchEffect(checkGameState) // 数据每次更新，检查游戏状态
/**
 * 检查游戏状态
 */
function checkGameState() {
  if (!mineGenerated) return
  const blocks = state.flat()
  if (blocks.every(item => item.revealed || item.flagged)) {
    if (blocks.some(item => item.flagged && !item.mine)) alert('You cheat!')
    else alert('You win!')
  }
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
  if (block.flagged) return 'bg-gray/10' // 插旗后没有经过效果
  if (!block.revealed) return 'bg-gray/10 hover:bg-gray/30' // 渲染默认及经过样式
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines] // 渲染处展示样式
}
</script>

<template>
  <div>
    Minesweeper
    <div p-5>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
      >
        <button
          v-for="(item, x) in row"
          :key="x"
          flex="~"
          items-center
          justify-center
          w-10
          h-10
          m="0.5"
          border="1 gray-400/10"
          :class="getBlockClass(item)"
          @click="onClick(item)"
          @contextmenu.prevent="onRightClick(item)"
        >
          <template v-if="item.flagged">
            <div i-mdi-flag text-red></div>
          </template>
          <template v-else-if="item.revealed || dev">
            <div v-if="item.mine" i-mdi-mine></div>
            <div v-else>{{ item.adjacentMines }}</div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
