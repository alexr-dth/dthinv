import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export default function NavigationLinks() {
  const { t } = useTranslation()
  const canGoBack = window.history.length > 1

  const handleBack = () => {
    if (canGoBack) window.history.back()
  }

  return (
    <div className="divide-x ">
      <Link to="/" className="action-link !ps-0">
        {t('Home')}
      </Link>
      <button
        onClick={handleBack}
        className="action-link px-1"
        disabled={!canGoBack}
      >
        {t('Back')}
      </button>
    </div>
  )
}
