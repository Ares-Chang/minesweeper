import type { BlockState } from '~/types'

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

export class GamePlay {
  mineGenerated = false // 游戏是否开始
  state = reactive(
    Array.from({ length: this.height }, (_, y) =>
      Array.from(
        { length: this.width },
        (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false })
      )
    )
  )

  constructor(public width: number, public height: number) {
    watchEffect(() => this.checkGameState) // 数据每次更新，检查游戏状态
  }

  /**
   * 计算生成炸弹
   * @param {Object} initial 初次点击格数据
   */
  generateMines(initial: BlockState) {
    for (const row of this.state) {
      for (const block of row) {
        // 初次点击位置上下左右一格内不生成炸弹
        if (Math.abs(initial.x - block.x) <= 1) continue
        if (Math.abs(initial.y - block.y) <= 1) continue
        block.mine = Math.random() < 0.2
      }
    }
    this.updateNumbers()
  }

  /**
   * 查找周边格位信息
   * @param {Object} block 当前格数据
   * @return {Array} 返回一个包含周边格信息的数组
   */
  getSiblings(block: BlockState) {
    // 遍历周围八个方向
    return directions
      .map(([dx, dy]) => {
        const x2 = block.x + dx
        const y2 = block.y + dy
        if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
          return undefined // 超出边界，弹出

        return this.state[y2][x2]
      })
      .filter(Boolean) as BlockState[] // 过滤空信息 && 断言(ts)不会有空信息存在
  }

  /**
   * 计算周围炸弹数
   */
  updateNumbers() {
    this.state.map(row => {
      row.map(block => {
        if (block.mine) return // 自身炸弹，弹出

        this.getSiblings(block).map(item => {
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
  expendZero(block: BlockState) {
    if (block.adjacentMines) return // 附近有炸弹弹出

    this.getSiblings(block).map(item => {
      // 没翻开并且没插旗，自动翻转
      if (!item.revealed && !item.flagged) {
        item.revealed = true
        this.expendZero(item)
      }
    })
  }

  /**
   * 点击翻牌
   * @param {Object} block 当前格数据
   */
  onClick(block: BlockState) {
    if (block.flagged) return // 如果已经插旗，不能翻转

    // 为优化游戏体验，第一次点击完成后再生成炸弹
    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) alert('BOOOM!')
    this.expendZero(block)
  }

  /**
   * 右键插旗
   * @param {Object} block 当前格数据
   */
  onRightClick(block: BlockState) {
    if (block.revealed) return // 如果已经展开，不能插旗
    block.flagged = !block.flagged
  }

  /**
   * 检查游戏状态
   */
  checkGameState() {
    if (!this.mineGenerated) return
    const blocks = this.state.flat()
    if (blocks.every(item => item.revealed || item.flagged)) {
      if (blocks.some(item => item.flagged && !item.mine)) alert('You cheat!')
      else alert('You win!')
    }
  }
}
