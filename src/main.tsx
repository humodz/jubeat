import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import 'simpledotcss';
import { App } from './App';
import './index.css';
import './simpledotcss-tweaks.css';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
