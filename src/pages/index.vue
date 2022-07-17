<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(6, 6, 3)
useStorage('mine-state', play.state) // 数据本地持久化
const state = computed(() => play.board)

const now = $(useNow())
const timerMS = $computed(() => Math.round((+now - play.state.value.startMS) / 1000)) // 游戏计时

/**
 * 计算炸弹剩余量(根据旗子数决定)
 */
const mineRest = $computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.boards.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break

    default:
      break
  }
}

watchEffect(() => {
  play.checkGameState() // 数据每次更新，检查游戏状态
})
</script>

<template>
  <div>
    Minesweeper

    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>

    <div flex="~ gap-10" justify-center>
      <div font-mono text-2xl flex="~ gap-1 items-center">
        <div i-carbon-timer />
        {{ timerMS }}
      </div>
      <div font-mono text-2xl flex="~ gap-1 items-center">
        <div i-mdi-mine />
        {{ mineRest }}
      </div>
    </div>

    <div py-5 overflow-auto>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
        w-max
        ma
      >
        <MineBlock
          v-for="(item, x) in row"
          :key="x"
          :item="item"
          @click="play.onClick(item)"
          @contextmenu.prevent="play.onRightClick(item)"
        />
      </div>
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
    </div>

    <!-- 胜利烟花 -->
    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
