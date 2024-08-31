import process from 'node:process'

export default defineNitroPlugin(async () => {
  if (import.meta.dev) {
    const flag = process.env.FBRH_BOOTSTRAP
    if (flag === undefined || flag === '0')
      return
  }

  if (!await bootstrap())
    process.exit(1)
})
