import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Settings() {

  useTituloDinamico("settings");

  return (
    <>
      <h2>Settings</h2>
    </>
  )
}

export default Settings;