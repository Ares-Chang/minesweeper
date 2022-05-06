<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(10, 10)
const state = play.state
</script>

<template>
  <div>
    Minesweeper
    <button @click="() => toggleDev()">{{ isDev }}</button>
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
  </div>
</template>
