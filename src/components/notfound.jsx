import React from "react";
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import { COLORS } from './colors.js';

function NotFound() {
  return (
    <div className="body" style={{backgroundColor : COLORS.lightred}}>
      <Container style={{width: 1300}}>
      <div>
        <h1>Oops! Resource Not Found.</h1>
      </div>
      <Card>
        <Card.Body>
          <Card.Title>Error 404: Not Found</Card.Title>
          <Card.Text>
            We're sorry! The requested resource doesn't exist.
          </Card.Text>
        </Card.Body>
      </Card>
      </Container>
    </div>
  );
}

export default NotFound;
