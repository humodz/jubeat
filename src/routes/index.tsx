import { createMemoryRouter, RouteObject } from 'react-router-dom';
import { Home } from './Home';
import { Play } from './Play';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/play',
    element: <Play />,
  },
];

export const router = createMemoryRouter(routes);
