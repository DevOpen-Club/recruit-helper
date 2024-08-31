export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    async onRequest({ options }) {
      const currentUser = useCurrentUser()
      if (currentUser.value) {
        const { session } = currentUser.value
        const headers = options.headers ??= {}
        if (Array.isArray(headers))
          headers.push(['Authorization', session])
        else if (headers instanceof Headers)
          headers.set('Authorization', session)
        else
          headers.Authorization = session
      }
    },
  })

  return {
    provide: { api },
  }
})
