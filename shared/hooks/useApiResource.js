import { useCallback, useEffect, useState } from 'react'

export function useApiResource(loader) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: '',
  })

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))

    try {
      const data = await loader()
      setState({ data, loading: false, error: '' })
    } catch (error) {
      setState({ data: null, loading: false, error: error.message })
    }
  }, [loader])

  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      try {
        const data = await loader()
        if (active) {
          setState({ data, loading: false, error: '' })
        }
      } catch (error) {
        if (active) {
          setState({ data: null, loading: false, error: error.message })
        }
      }
    })

    return () => {
      active = false
    }
  }, [loader])

  return { ...state, reload }
}
