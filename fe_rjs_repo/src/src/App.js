import React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';
import Login from './Login';
import Home from './Home';
import UserManagement from './UserManagement';
import Kanban from './Kanban';
import { VerifyCurrent, CheckGroup } from './Utility';
import Logout from './Logout';

function App() {
  
  const [login, setLogin] = useState(false);
  const [acronym, setAcronym] = useState("");

  
  useEffect(() => {
    
    async function ReviveSession() {

      let result = await VerifyCurrent();
      
      if (result !== login) {
        //change in status, update login
        setLogin(result);
      }
  
      if (!result) {
  
        Logout(null, setLogin);
      }
  
      return;
    }
    ReviveSession();
  }, [login]);

  return (

    <div>
      <BrowserRouter>
        <Routes>
          <Route index path="/*" element={<Navigate to={(login === true) ? "/home" : "/login"}/>}/>
          <Route path="/login" element={(login === true) ? <Navigate to="/home"/> : <Login login={setLogin}/>}/>
          {login &&
          <>
            <Route path="/home" element={(login === true) ? <Home logout={setLogin} setAcronym={setAcronym}/> : <Navigate to="/login"/>}/>
            <Route path="/manageusers" element={((login === true && CheckGroup('admin')) ? <UserManagement logout={setLogin}/> : <Navigate to="/login"/>)}/>
            <Route path="/board" element={(login === true) ? <Kanban logout={setLogin} acronym={acronym} setAcronym={setAcronym}/> : <Navigate to="/login"/>}/>
          </>
          }
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
