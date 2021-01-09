import React from 'react';
import { Helmet } from 'react-helmet';

function BrowserTitle() {
  return (
    <Helmet>
      <title>兼容IE10</title>
    </Helmet>
  );
}

export default BrowserTitle;