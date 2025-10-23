import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import useMediaQuery from '@/composables/useMediaQuery'
import breakpoints from '@/assets/styles/breakpoints.module.scss'

export const playtime = ref<number>(0)
export const playing = ref<boolean>(false)
export const rapid = ref<boolean>(false)

export const canHover = useMediaQuery('hover', 'hover')
export const hasMouse = useMediaQuery('pointer', 'fine')
export const { width } = useWindowSize()
export const isMobile = computed(() => width.value < parseInt(breakpoints.tablet))
export const isTablet = computed(() => width.value < parseInt(breakpoints.laptop))
