import React, { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from "react-router-dom";
import { COLORS } from './colors.js';
import util from '../util.js';

function CreateTask() {
  const [userChecked, setUserChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* If the user is not logged in, redirect to signin. */
  useEffect(() => {
    if (!userChecked) {
      checkUser();
    }
  });

  /* function getQueryParams
   *
   * Returns the name of the event
   */
  function getQueryParams() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    return params.event;
  }

  /* function checkUser
   *
   * Routes user to '/' if user not logged in as an organization.
   */
  function checkUser() {
    util.requestGET('/causes_api/get_user').then(res => {
      if (res.status === 200) {
        res.json().then(body => {
          if ('organization' in body) {
            setUserChecked(true);
          } else {
            navigate('/');
          }
        })
      } else {
        navigate('/');
      }
    });
  }

  function formSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.target);
    formData.set('event', getQueryParams());
    util.consolidateFormDataTime(formData);
    util.requestPOST('/causes_api/createtask', formData)
      .then(res => {
        if (res.status === 200) {
          res.json().then(body => {
            const org_name = body['org_name'];
            const event_name = body['event_name'];

            const eventParams = {
              'event' : event_name,
              'org' : org_name,
            }
            navigate('/eventhome?' + new URLSearchParams(eventParams));
           
          })
        } else {
          res.text().then(data => {
            setError(`${data}`);
          });
        }
        setLoading(false);
      });
  }

  return (
    <div className= "body">
      <Container style={{width: 1300}}>
      {userChecked &&
        <div className="body">
          <Card style={{backgroundColor : COLORS.lightaqua, width: '600px'}} className = "mx-auto my-3">
          <Card.Body>
          <Card.Title>Create a New Task</Card.Title>
          <Card.Text style={{textAlign: "left"}}>
          <Form onSubmit={formSubmit}>
            <Form.Group>
              <Form.Label>Name of Task</Form.Label>
              <Form.Control placeholder="Enter task name" name='name'/>
            </Form.Group>

            <Form.Group>
              <Form.Label>Deadline</Form.Label>
              <Form.Control placeholder="Enter task deadline" name='date' type='date' defaultValue={util.getCurrentDate()} />
              <div style={{display: "flex", paddingTop: 10}}>
                <Form.Control name='hour' style={{width: "45px"}} defaultValue='12' onBlur={util.hourInputChange}/>
                <div style={{fontSize: 24, paddingInline: 4}}>:</div>
                <Form.Control name='minutes' style={{width: "45px"}} defaultValue='00' onBlur={util.minuteInputChange}/>
                <div style={{paddingLeft: 10}}>
                  <Form.Select style={{width: "80px"}} name='meridiem'>
                    <option>AM</option>
                    <option>PM</option>
                  </Form.Select>
                </div>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control placeholder="Enter task description" name='description'/>
            </Form.Group>

            {error &&
              <Form.Group>
                <Form.Label className="error">{error}</Form.Label>
              </Form.Group>
            }

            <Form.Group className='mt-3'>
              {!loading &&
                <Button variant="outline-secondary" type="submit">
                  Create Task
                </Button>
              }
              {loading &&
                <Spinner animation="border" variant="primary" />
              }
            </Form.Group>

          </Form>
          </Card.Text>
          </Card.Body>
          </Card>
        </div>
      }
      {!userChecked &&
        <div className="my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      }
      </Container>
    </div>
  );
}

export default CreateTask;
