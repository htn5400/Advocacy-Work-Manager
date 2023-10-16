import React from 'react';
import { Outlet } from 'react-router';
import Container from 'react-bootstrap/Container'
import { Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar'
import { COLORS } from './colors.js';

function Pika() {
  return (
    <>
      <div className="Navigation">
        <Navbar fluid expand="md" variant="light" style={{backgroundColor: COLORS.lightpurple}}>
          <Container style={{maxWidth: '1500px'}}>
              <Link to="/" className="navbar-brand" style={{color: COLORS.navpurple}}>
              <h2>
                Team Pika
              </h2></Link>
            </Container>
        </Navbar>
        </div>
      <Outlet />
    </>
  );
};

export default Pika;
