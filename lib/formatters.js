export const formatPace = (seconds) => {
  return `${formatTime(seconds)} / km`
}

export const formatTime = (seconds) => {
  if (seconds == null) return '-'

  const mins = Math.floor(seconds / 60)
  const secs = String(Math.round(seconds) % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

export const formatDistance = (meters) => {
  return `${(meters / 1000).toFixed(2)}km`
}

export const getPositiveSign = (number) => {
  switch (Math.sign(number)) {
    case 1: return '+'
    default: return ''
  }
}
