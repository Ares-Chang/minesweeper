/**
 * 格位数据格式
 */
export interface BlockState {
  x: number // 坐标 X
  y: number // 坐标 Y
  revealed: boolean // 是否翻开
  mine?: boolean // 是否炸弹
  flagged?: boolean // 是否被标记
  adjacentMines: number // 附近炸弹数
}
