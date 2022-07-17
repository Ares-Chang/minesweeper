import type { Ref } from 'vue'
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
  [0, -1],
]

/**
 * 游戏状态接口
 */
interface GameState {
  board: BlockState[][] // 存储面板格位数据
  mineGenerated: Boolean // 游戏是否开始
  gameState: 'play' | 'won' | 'lost' // 游戏状态
  startMS: number // 游戏时长
}
export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  // 引用不便，直接指向
  get board() {
    return this.state.value.board
  }

  // 二维数组扯平
  get boards() {
    return this.state.value.board.flat()
  }

  /**
   * 游戏格位数据初始化
   */
  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from(
          { length: this.width },
          (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false }),
        ),
      ),
      mineGenerated: false,
      gameState: 'play',
      startMS: +Date.now(),
    }
  }

  /**
   * 获取指定范围随机数
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {number} 指定范围内随机数
   */
  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  /**
   * 获取指定范围随机整数
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {number} 指定范围内随机整数
   */
  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  /**
   * 计算生成炸弹
   * @param {Object} initial 初次点击格数据
   */
  generateMines(state: BlockState[][], initial: BlockState) {
    /**
     * 判断炸弹生成位置函数
     * @returns {Boolean} 炸弹是否生成成功
     */
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      // 初次点击位置上下左右一格内不生成炸弹
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false // 如果已经是弹窗
      block.mine = true
      return true
    }
    // 生成炸弹并指定位置
    Array.from({ length: this.mines }, () => null).forEach(() => {
      let placed = false // 记录当前炸弹是否生成成功
      while (!placed) placed = placeRandom()
    })
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

        return this.board[y2][x2]
      })
      .filter(Boolean) as BlockState[] // 过滤空信息 && 断言(ts)不会有空信息存在
  }

  /**
   * 计算周围炸弹数
   */
  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return // 自身炸弹，弹出

        this.getSiblings(block).forEach((item) => {
          // 周围如果有炸弹，炸弹计算 +1
          if (item.mine)
            block.adjacentMines += 1
        })
      })
    })
  }

  /**
   * 清除相连的 0 字块
   * @param {Object} block 初次点击格数据
   */
  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return // 附近有炸弹

    this.getSiblings(block).forEach((item) => {
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
    if (block.flagged)
      return // 如果已经插旗，不能翻转

    // 为优化游戏体验，第一次点击完成后再生成炸弹
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.state.value.board, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      return
    }
    this.expendZero(block)
  }

  /**
   * 右键插旗
   * @param {Object} block 当前格数据
   */
  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return // 游戏未处于开始状态，不可操作
    if (block.revealed)
      return // 如果已经展开，不能插旗
    block.flagged = !block.flagged
  }

  /**
   * 双击自动展开
   * @param {object} block 当前格数据
   */
  autoExpand(block: BlockState) {
    const sliblings = this.getSiblings(block)
    const flags = sliblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0) // 计算周围旗子数量
    const notRevealed = sliblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0) // 计算周围未翻转数量

    // 如果周围旗子数和炸弹数相等 自动翻开周围格子
    if (flags === block.adjacentMines)
      sliblings.forEach(item => item.revealed = true)

    const missingFlags = block.adjacentMines - flags
    // 如果周围未翻开数量与插旗子数量相等 自动插旗
    if (notRevealed === missingFlags)
      sliblings.forEach(item => !item.revealed && !item.flagged && (item.flagged = true))
  }

  /**
   * 游戏结束，翻转所有地雷
   */
  showAllMines() {
    this.board.flat().map(item => item.mine && (item.revealed = true))
  }

  /**
   * 检查游戏状态
   */
  checkGameState() {
    if (this.state.value.gameState !== 'play')
      return // 游戏未处于开始状态，不可操作
    if (!this.state.value.mineGenerated)
      return // 游戏未开始，不做检查
    const blocks = this.board.flat()
    if (blocks.every(item => item.revealed || item.flagged)) {
      if (blocks.some(item => item.flagged && !item.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else {
        this.state.value.gameState = 'won'
      }
    }
  }
}
