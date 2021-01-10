import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

function BrowserTitle() {
  const [ t, ] = useTranslation();
  return (
    <Helmet>
      <title>{t('pageTitle')}</title>
    </Helmet>
  );
}

export default BrowserTitle;