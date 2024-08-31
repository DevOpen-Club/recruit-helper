export default defineNitroPlugin((app) => {
  app.hooks.hookOnce('close', async () => {
    await db.$disconnect()
  })
})
