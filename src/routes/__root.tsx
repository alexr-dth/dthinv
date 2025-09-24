import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { healthCheck } from '@/api/api'

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
