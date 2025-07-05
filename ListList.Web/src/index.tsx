import React from 'react';

import { App } from './views/app/App';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/main.scss';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('app'));
root.render(<App />);
