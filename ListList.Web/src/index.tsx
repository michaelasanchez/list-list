import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './views/app';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/main.scss';

ReactDOM.render(<App />, document.querySelector('.app'));
