import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import NotFound404 from './pages/NotFound404';
import EditServerPage from './pages/EditServerPage';
import DeleteServerPage from './pages/DeleteServerPage';

const router = createBrowserRouter([
  {
    path: '*',
    element: <Navigate to='/mcServerStatus' replace />,
    errorElement: <NotFound404 />,
  },
  {
    path: "/mcServerStatus",
    element: <App />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/mcServerStatus/edit',
    element: <EditServerPage />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/edit',
    element: <Navigate to='/mcServerStatus/edit' replace />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/mcServerStatus/add',
    element: <EditServerPage />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/add',
    element: <Navigate to='/mcServerStatus/add' replace />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/mcServerStatus/delete',
    element: <DeleteServerPage />,
    errorElement: <NotFound404 />,
  },
  {
    path: '/delete',
    element: <Navigate to='/mcServerStatus/delete' replace />,
    errorElement: <NotFound404 />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
