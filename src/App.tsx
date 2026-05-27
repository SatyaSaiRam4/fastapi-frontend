
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UsersScreen from './screens/Users/UsersScreen';
import IteamsScreen from './screens/Iteams/IteamsScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersScreen />} />
        <Route path="/iteams" element={<IteamsScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
