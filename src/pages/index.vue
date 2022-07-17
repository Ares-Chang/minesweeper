<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(5, 5, 3)
useStorage('mine-state', play.state) // 数据本地持久化
const state = computed(() => play.board)

watchEffect(() => {
  play.checkGameState() // 数据每次更新，检查游戏状态
})
</script>

<template>
  <div>
    Minesweeper
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

    <div>
      Count: {{ play.boards.reduce((a, b) => a + (b.mine ? 1 : 0), 0) }}
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        RESET
      </button>
    </div>

    <!-- 胜利烟花 -->
    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
