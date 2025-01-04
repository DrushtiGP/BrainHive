import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateGroupPage from './components/CreateGroupPage';
import JoinGroupPage from './components/JoinGroupPage';
import SessionWindow from './components/SessionWindow'; // Import SessionWindow component
import GroupMessages from './components/GroupChat'; // Import GroupMessages component
import './App.css';

const App = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null); // Track the current group
  const [groups, setGroups] = useState([]); // Track the list of groups user is part of

  const handleGroupCreated = async (group) => {
    try {
      const sessionResponse = await axios.post('http://localhost:3001/sessions', {
        groupId: group.id,
        topic: 'Introductory Session', // Static topic for now
        timing: new Date(),
      });
      setCurrentGroup(group);
      //alert('Group and session created successfully!');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const fetchUserGroups = async () => {
    if (loggedInUser) {
      try {
        const response = await axios.get(`http://localhost:3001/groups/user/${loggedInUser.id}`);
        setGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    }
  };

  // Fetch groups whenever the user logs in
  useEffect(() => {
    fetchUserGroups();
  }, [loggedInUser]);

  return (
    <Router>
      <AppContent
        isLoginPage={isLoginPage}
        setIsLoginPage={setIsLoginPage}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
        currentGroup={currentGroup}
        setCurrentGroup={setCurrentGroup}
        handleGroupCreated={handleGroupCreated}
        groups={groups} // Pass groups to be used in messaging
      />
    </Router>
  );
};

const AppContent = ({
  isLoginPage, setIsLoginPage, name, setName, email, setEmail, password, setPassword,
  loginEmail, setLoginEmail, loginPassword, setLoginPassword, loggedInUser, setLoggedInUser,
  currentGroup, setCurrentGroup, handleGroupCreated, groups,
}) => {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', { name, email, password });
      // Show success message and redirect to login page
      //alert(response.data.message);
      setIsLoginPage(true);
    } catch (error) {
     // alert('Registration failed. ' + (error.response?.data?.error || 'Error'));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email: loginEmail,
        password: loginPassword,
      });
      setLoggedInUser(response.data.user);
      // Redirect to home page after successful login
      navigate('/home');
    } catch (error) {
      //alert('Login failed. ' + (error.response?.data?.error || 'Error'));
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    navigate('/');
  };

  const togglePage = () => {
    setIsLoginPage(!isLoginPage);
  };

  return (
    <div>
      <h1>BrainHive Study Groups</h1>

      {!loggedInUser ? (
        isLoginPage ? (
          <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p>
              Don't have an account?{' '}
              <button onClick={togglePage}>Register here</button>
            </p>
          </div>
        ) : (
          <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
            <p>
              Already have an account?{' '}
              <button onClick={togglePage}>Login here</button>
            </p>
          </div>
        )
      ) : (
        <div>
          <h2>Welcome, {loggedInUser.name}!</h2>
          <button onClick={() => navigate('/create-group')}>Create Group</button>
          <button onClick={() => navigate('/join-group')}>Join Group</button>
          <button onClick={() => navigate('/messages')}>Group Messages</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <Routes>
        <Route path="/home" element={<h2>Welcome Home</h2>} />
        <Route
          path="/create-group"
          element={<CreateGroupPage loggedInUser={loggedInUser} onGroupCreated={handleGroupCreated} />}
        />
        <Route path="/join-group" element={<JoinGroupPage loggedInUser={loggedInUser} />} />
        <Route
          path="/sessions"
          element={<SessionWindow loggedInUser={loggedInUser} currentGroup={currentGroup} />}
        />
        <Route
          path="/messages"
          element={<GroupMessages loggedInUser={loggedInUser} groups={groups} />}
        />
      </Routes>
    </div>
  );
};

export default App;
