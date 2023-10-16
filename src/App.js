import React from 'react';
import './App.css';
import Container from 'react-bootstrap/Container'
import { Routes, Route } from "react-router-dom";
import { SignIn, SignUpVol, SignUpOrg, OrgHome, VolHome, CreateEvent, CreateTask, EventHome, Search, NotFound, Navigation, Pika} from "./components";

function App() {
  return (
    <div className="App" style={{backgroundColor: '#e8f6fc', height: '100vh'}}>
        <div className="main">
          <Container fluid className="m-0 p-0">
            <Routes>
            
            <Route element={<Pika/>}>
              <Route path="/" element={<SignIn />} />
              <Route path="/signupvol" element={<SignUpVol />} />
              <Route path="/signuporg" element={<SignUpOrg />} />
            </Route>

            <Route element={<Navigation/>}>
              <Route path="/orghome" element={<OrgHome />} />
              <Route path="/volhome" element={<VolHome />} />
              <Route path="createevent" element={<CreateEvent />} />
              <Route path="createtask" element={<CreateTask />} />
              <Route path="eventhome" element={<EventHome />} />
              <Route path="search" element={<Search />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Container>
        </div>
    </div>
  );
}

export default App;