import React, { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner';
import { Link, useNavigate } from "react-router-dom";
import util from '../util.js';
import { COLORS } from './colors.js';

function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* If the user is logged in already, redirect to home. */
  useEffect(() => {
    util.requestGET('/causes_api/get_user').then(res => {
      if (res.status === 200) {
        res.json().then(body => {
          if ('volunteer' in body) {
            navigate('/volhome');
          } else {
            navigate('/orghome')
          }
        });
      }
    });
  });

  function formSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.target);
    util.requestPOST('/causes_api/signin', formData)
      .then(res => {
        if (res.status === 200) {
          res.json().then(body => {
            if ('volunteer' in body) {
              navigate('/volhome');
            } else {
              navigate('/orghome')
            }
          });
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
      <Card.Title>Sign In</Card.Title>
      <Card.Text style={{textAlign: "left"}}>
      <Form onSubmit={formSubmit}>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" name="username" placeholder="Enter username" required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" placeholder="Password" required/>
        </Form.Group>

        {error &&
          <Form.Group>
            <Form.Label className="error">{error}</Form.Label>
          </Form.Group>
        }

        {!loading &&
          <Button variant="outline-secondary" type="submit">
            Submit
          </Button>
        }
        {loading &&
          <Spinner animation="border" variant="primary" />
        }

      </Form>
      </Card.Text>
      <p>Don't have an account?</p>
      <Link to="/signupvol">Create Volunteer Account</Link> <span> or </span>
      <Link to="/signuporg">Create Organization Account</Link>
      </Card.Body>
      </Card>
      </Container>
    </div>
  );
}

export default SignIn;
