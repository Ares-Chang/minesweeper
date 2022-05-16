<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(5, 5)
useStorage('mine-state', play.state) // 数据本地持久化
const state = computed(() => play.board)

watchEffect(() => {
  play.checkGameState() // 数据每次更新，检查游戏状态
})
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
        <MineBlock
          :item="item"
          v-for="(item, x) in row"
          :key="x"
          @click="play.onClick(item)"
          @contextmenu.prevent="play.onRightClick(item)"
        />
      </div>
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">{{ isDev ? 'DEV' : 'NORMAL' }}</button>
      <button btn @click="play.reset()">RESET</button>
    </div>
  </div>
</template>
