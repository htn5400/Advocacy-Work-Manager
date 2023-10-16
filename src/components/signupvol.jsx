import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container'
import { Link, useNavigate } from "react-router-dom";
import util from '../util.js';
import { COLORS } from './colors.js';

function SignUpVol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function formSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.target);
    util.requestPOST('/causes_api/signupvol', formData)
      .then(res => {
        if (res.status === 200) {
          navigate('/volhome');
        } else {
          res.text().then(data => {
            setError(`${data}`);
          });
        }
        setLoading(false);
      });
  }

  return (
    <div className="body">
      <Container style={{width: 1300}}>
      <Card style={{backgroundColor : COLORS.lightaqua, width: '600px'}} className = "mx-auto my-3">
      <Card.Body>
      <Card.Title>Volunteer Sign Up</Card.Title>
      <Card.Text style={{textAlign: "left"}}>
      <Form onSubmit={formSubmit}>

        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control placeholder="Enter your name" name="name" required/>
        </Form.Group>

        <Form.Group>
          <Form.Label>Bio</Form.Label>
          <Form.Control placeholder="Enter your bio" name="bio" as="textarea" rows={3} required/>
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter your email" name="email" required/>
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Account Username</Form.Label>
          <Form.Control placeholder="Enter a username" name="username" required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Account Password</Form.Label>
          <Form.Control type="password" placeholder="Enter a password" name="password" required/>
        </Form.Group>

        {error &&
          <Form.Group>
            <Form.Label className="error mb-3">{error}</Form.Label>
          </Form.Group>
        }

        {!loading &&
          <Button variant="outline-secondary" type="submit">
            Create a volunteer account
          </Button>
        }
        {loading &&
          <Spinner animation="border" variant="primary" />
        }

      </Form>
      </Card.Text>
      <span>Already have an account? </span>
      <Link to="/">Sign In </Link>
      </Card.Body>
      </Card>
      </Container>
    </div>
  );
}

export default SignUpVol;
