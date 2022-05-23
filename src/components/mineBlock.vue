<script setup lang="ts">
import type { BlockState } from '~/types'
import { isDev } from '~/composables'

defineProps<{ item: BlockState }>()
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
  <button
    flex="~"
    items-center
    justify-center
    min-w-10
    min-h-10
    m="0.5"
    border="1 gray-400/10"
    :class="getBlockClass(item)"
  >
    <template v-if="item.flagged">
      <div i-mdi-flag text-red></div>
    </template>
    <template v-else-if="item.revealed || isDev">
      <div v-if="item.mine" i-mdi-mine></div>
      <div v-else font-700>{{ item.adjacentMines }}</div>
    </template>
  </button>
</template>
