export default defineNuxtRouteMiddleware((to) => {
  const user = useCurrentUser().value
  if (!user) {
    const next = encodeURI(to.fullPath)
    return navigateTo(`/login?next=${next}`, { replace: true })
  }
})
