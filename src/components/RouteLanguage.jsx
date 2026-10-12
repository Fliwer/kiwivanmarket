import { useEffect } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Direct arrivals and history use the URL's language. Internal links without
// a language carry the selection forward instead of changing their content
// while leaving an English URL in the address bar.
export default function RouteLanguage() {
  const location = useLocation();
  const navigate = useNavigate();
  const action = useNavigationType();
  const { i18n } = useTranslation();
  useEffect(() => {
    const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const params = new URLSearchParams(location.search);
    const requested = params.get('lang');
    if (['en', 'fr', 'es'].includes(requested)) {
      if (language !== requested) i18n.changeLanguage(requested);
    } else if (requested === null && action === 'PUSH' && language !== 'en') {
      params.set('lang', language);
      navigate({ pathname: location.pathname, search: '?' + params, hash: location.hash }, { replace: true });
    } else if (language !== 'en') {
      i18n.changeLanguage('en');
    }
  }, [location.pathname, location.search, location.hash, action, i18n, navigate]);
  return null;
}
