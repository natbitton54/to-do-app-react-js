import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './Components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './index.css'
import CatchAllRoutes from './Components/CatchAllRoutes';
import CategoryPage from './pages/CategoryPage';
import Account from './pages/Account';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route
        path='/'
        element={<ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* New route for category pages */}
      <Route
        path="/dashboard/categories/:categorySlug"
        element={
          <ProtectedRoute>
            <CategoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/*logout route for all*/}
      <Route
        path="*"
        element={
          <CatchAllRoutes />
        }
      />


      <Route path='*' element={<NotFound />} /> {/* This route goes last */}
    </Routes>
  );
}

export default App;
