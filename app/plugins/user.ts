export default defineNuxtPlugin(async () => {
  const currentUser = useCurrentUser()

  if (!useCookie('session').value)
    return
  try {
    currentUser.value = await $fetch('/api/auth/session', {
      method: 'POST',
      body: {
        session: useCookie('session').value,
      },
    })
  }
  catch (e) {
    console.error(e)
    currentUser.value = undefined
  }
})
