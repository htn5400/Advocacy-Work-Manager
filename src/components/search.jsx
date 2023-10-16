import React, { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { COLORS } from './colors.js';
import { Link, useNavigate } from "react-router-dom";

import util from '../util.js';

function Search() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  const navigate = useNavigate();

  /* If the user is not logged in, redirect to signin. */
  useEffect(() => {
    if (!userChecked) {
      checkUser();
    }

    if (data === null && error === null) {
      makeEmptySearchRequest();
    }
  });

  /* function checkUser
   *
   * Routes user to '/' if user not logged in.
   */
  function checkUser() {
    util.requestGET('/causes_api/get_user').then(res => {
      if (res.status !== 200) {
        navigate('/');
      } else {
        setUserChecked(true);
      }
    });
  }

  function makeSearchRequest(formData) {
    util.requestPOST('/causes_api/searchorgs', formData)
      .then(res => {
        if (res.status === 200) {
          res.json().then(body => {
            setData(body);
          });
        } else if (res.status === 401) {
          navigate('/');
        } else {
          setError('An error has occurred. Please try again.');
          setData(null); // TODO: see if this is wrong
        }
      }
    );
  }

  function makeEmptySearchRequest() {
    setError(null);
    setData(false);

    const formData = new FormData();
    makeSearchRequest(formData);
  }

  function formSubmit(e) {
    e.preventDefault();

    setError(null);
    setData(false);

    const formData = new FormData(e.target);
    makeSearchRequest(formData);
  }

  return (
    <div className= "body">
      <Container style={{width: 1300}}>
      {userChecked &&
        <div className="search">
            <Card style={{backgroundColor : COLORS.lightaqua, width: '600px'}} className = "mx-auto my-3">
            <Card.Body>
            <Card.Title>Find New Organizations</Card.Title>
            <Card.Text style={{textAlign: "left"}}>
            <Form onSubmit={formSubmit}>
            <Form.Group as={Row} className="mb-3">
                <Col><Form.Control type="text" placeholder="Search" name="searchInput"/></Col>
                <Col><Button variant="primary" type="submit" >
                    Search
                </Button></Col>
            </Form.Group>
            </Form>

            </Card.Text>
            </Card.Body>
            </Card>

            
            {data === false &&
              <div className="my-3">
                <Spinner animation="border" variant="primary" />
              </div>
            }
            <Container>
            <Row>
            {data && data.length > 0 &&
              data.map(org => {
                return (
                    <Col sm="6" key={org.name}>
                    <Card style={{backgroundColor : COLORS.lightorange}} className="my-3">
                      <Link to={"/orghome?"+ new URLSearchParams({"org": org.name})} style={{ textDecoration: 'none', color : COLORS.darkorange}}>
                        <Card.Body>
                        <Card.Title>{org.name}</Card.Title>
                        <Card.Text>
                            <div>{org.category}</div>
                            <div>{org.bio}</div>
                        </Card.Text>
                        </Card.Body>
                        </Link>
                    </Card>
                    </Col>
                );
              })
            }
            </Row>
            </Container>
            {data && data.length === 0 &&
              <Card className="my-3">
                <Card.Body>
                <Card.Title>
                    <div>No Organizations Found</div>
                </Card.Title>
                </Card.Body>
              </Card>
            }
            {error &&
              <Card className="my-3">
                <Card.Body>
                <Card.Title>
                    <div>{error}</div>
                </Card.Title>
                </Card.Body>
              </Card>
            }
        </div>
      }
      {!userChecked &&
        <div className="my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      }
      </Container>
    </div>
  )
}

export default Search;