export const isDev = ref(false) // 开发模式，可查看详情
export const toggleDev = useToggle(isDev) // 更改开发模式
