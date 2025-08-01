import React from 'react';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/main.scss';

import { App } from './views/app/App';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('app'));
root.render(<App />);
