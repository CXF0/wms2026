import dayjs from 'dayjs'
export const fmtDate  = (v?: string | null) => v ? dayjs(v).format('YYYY-MM-DD') : '—'
export const fmtShort = (v?: string | null) => v ? dayjs(v).format('MM-DD HH:mm') : '—'
export const fmtFull  = (v?: string | null) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '—'
export const today    = () => dayjs().format('YYYY-MM-DD')
export const gramsToKg = (g: number) => (g / 1000).toFixed(2)
