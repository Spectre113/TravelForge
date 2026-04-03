import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import CityDetail from './pages/CityDetail';
import SavedTrips from './pages/SavedTrips';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileMenu from './components/ProfileMenu';
import MobileMenu from './components/MobileMenu';

function AppContent() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="container header__inner">
          <h1 className="logo">Бюджетный компас</h1>
          <nav className="nav nav--desktop">
            <NavLink to="/" end>Главная</NavLink>
            <NavLink to="/results">Результаты</NavLink>
            <ProfileMenu />
          </nav>
          <div className="nav--mobile">
            <MobileMenu />
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/city/:id" element={<CityDetail />} />
          <Route path="/saved" element={<SavedTrips />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}