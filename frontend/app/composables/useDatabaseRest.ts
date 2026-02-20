export const useDatabaseRest = () => {
  const config = useRuntimeConfig()

  const getUrl = (path: string): string => {
    if (config.public.useEmulator === 'true') {
      const ns = config.public.firebaseProjectId
      return `http://127.0.0.1:9000/${path}.json?ns=${ns}-default-rtdb`
    }
    return `https://${config.public.firebaseProjectId}-default-rtdb.firebaseio.com/${path}.json`
  }

  const getData = async <T>(path: string): Promise<T | null> => {
    const data = await $fetch<T | null>(getUrl(path)).catch(() => null)
    return data ?? null
  }

  const getList = async <T extends { id?: string }>(path: string): Promise<T[]> => {
    const data = await $fetch<Record<string, T> | null>(getUrl(path)).catch(() => null)
    if (!data) return []
    return Object.entries(data).map(([id, item]) => ({ ...item, id }))
  }

  return { getData, getList }
}
