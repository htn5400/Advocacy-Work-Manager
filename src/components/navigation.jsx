import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Link, useNavigate } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner';
import util from "../util.js";
import { COLORS } from './colors.js';


function Navigation() {
  const navigate = useNavigate();
  const [signOutLoading, setSignOutLoading] = useState(false);

  function signOutRequest() {
    setSignOutLoading(true);
    util.requestPOST('/causes_api/signout', "")
      .then(res => {
        setSignOutLoading(false);
        navigate('/');
      });
  }

  return (
    <>
      <div className="Navigation">
        <Navbar fluid expand="md" variant="light" style={{backgroundColor: COLORS.lightpurple}}>
          <Container style={{maxWidth: '1500px'}}>
            <Link to="/" className="navbar-brand" style={{color: COLORS.navpurple}}>
            <h2>
              Team Pika
            </h2></Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="flex-grow-1">
                <Nav.Item>
                <Link className="nav-link" to="/" style={{color: COLORS.navpurple}}><h3>Home</h3></Link>
                </Nav.Item>
                <Nav.Item>
                <Link className="nav-link" to="/search" style={{color: COLORS.navpurple}}><h3>Search</h3></Link>
                </Nav.Item>
                <Nav.Item className="ms-auto">
                {!signOutLoading &&
                    <Link className="nav-link" to="/" onClick={signOutRequest} style={{color: COLORS.navpurple}}><h3>Sign Out</h3></Link>
                    }
                    {signOutLoading &&
                    <Spinner animation="border" variant="primary" />
                }
                </Nav.Item>
                </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        </div>
      <Outlet />
    </>
  );
};

export default Navigation;
