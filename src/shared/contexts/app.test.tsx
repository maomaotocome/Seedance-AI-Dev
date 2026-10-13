import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AppContextProvider, useAppContext } from './app';

function AuthStateProbe() {
  const { isCheckSign } = useAppContext();
  return <span>{isCheckSign ? 'checking' : 'ready'}</span>;
}

test('keeps the first server and browser-compatible auth render in checking state', () => {
  const html = renderToStaticMarkup(
    <AppContextProvider>
      <AuthStateProbe />
    </AppContextProvider>
  );

  assert.equal(html, '<span>checking</span>');
});
