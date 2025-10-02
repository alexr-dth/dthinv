import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { healthCheck } from '@/api/api'
import { useLocation } from '@tanstack/react-router'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const { i18n } = useTranslation()
    const change = (lng) => i18n.changeLanguage(lng)
    const { t } = useTranslation()

    const checkServer = async () => {
      try {
        await healthCheck()
        // toast.success('Server reached')
      } catch (error) {
        toast.error('Server unreachable')
      }
    }

    useEffect(() => {
      checkServer()
    }, [])

    return (
      <>
        {/* <Header /> */}
        <Toaster position="top-right" reverseOrder={true} />
        <ScrollRestoration />

        <Outlet />

        <footer
          className="w-full p-2 text-xs  border-t border-gray-200 
                   sm:text-center text-start"
        >
          <select
            onChange={(e) => change(e.target.value)}
            className="border rounded text-lg"
          >
            <option value={'en'}>English</option>
            <option value={'es'}>Spanish</option>
            <option value={'zh'}>Chinese</option>
          </select>

          <div className="text-gray-500">
            <span className="font-medium">{t('Last update')}</span>{' '}
            {__APP_BUILD_DATE__}
            <span className="ml-2 text-[10px] text-gray-400">(UTC)</span>
          </div>
        </footer>

        {import.meta.env.DEV && (
          <TanstackDevtools
            config={{
              position: 'bottom-left',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
      </>
    )
  },
})

/** --- Scroll Restoration --- **/
function ScrollRestoration() {
  const location = useLocation()
  const prevKeyRef = useRef(location.key)

  // 1) Persist scroll on scroll (debounced)
  useEffect(() => {
    let ticking = false
    const save = () => {
      const x = window.scrollX || 0
      const y = window.scrollY || 0
      // Keep anything else already in state
      history.replaceState({ ...history.state, __scroll: { x, y } }, '')
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          save()
          ticking = false
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Save one time immediately (e.g., if user doesn't scroll)
    save()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 2) Restore on browser back/forward
  useEffect(() => {
    const handler = () => {
      const pos = history.state?.__scroll
      // Delay a tick so the new DOM has painted
      setTimeout(() => {
        if (pos && typeof pos.y === 'number') {
          window.scrollTo(pos.x ?? 0, pos.y ?? 0)
        }
      }, 0)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // 3) On forward navigations (new page), scroll to top
  useEffect(() => {
    const isSameEntry = prevKeyRef.current === location.key
    prevKeyRef.current = location.key

    // If it's not a popstate (same entry), assume push/replace to a new page:
    // TanStack Router changes location.key for new entries; popstate keeps key but triggers our popstate handler above.
    if (!isSameEntry) {
      const pos = history.state?.__scroll
      // If there’s no stored scroll for this fresh page, go to top
      if (!pos) window.scrollTo(0, 0)
    }
  }, [location.key])

  return null
}
/** --- /Scroll Restoration --- **/
