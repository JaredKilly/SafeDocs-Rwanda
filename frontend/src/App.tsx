import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Folders from './pages/Folders';
import AccessRequests from './pages/AccessRequests';
import Groups from './pages/Groups';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AuditLogs from './pages/AuditLogs';
import HR from './pages/HR';
import Government from './pages/Government';
import Healthcare from './pages/Healthcare';
// Marketing / public pages
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import Changelog from './pages/Changelog';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Press from './pages/Press';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Compliance from './pages/Compliance';
import Cookies from './pages/Cookies';
import NotFound from './pages/NotFound';
import SharedDocument from './pages/SharedDocument';
import theme from './theme';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/folders" element={<Folders />} />
            <Route path="/access-requests" element={<AccessRequests />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/government" element={<Government />} />
            <Route path="/healthcare" element={<Healthcare />} />
            {/* Public / marketing pages */}
            <Route path="/security" element={<Security />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/press" element={<Press />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/cookies" element={<Cookies />} />
            {/* Public share link */}
            <Route path="/share/:token" element={<SharedDocument />} />
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
