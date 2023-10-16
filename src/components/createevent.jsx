import React, { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from "react-router-dom";
import { COLORS } from './colors.js';
import util from '../util.js';

function CreateEvent() {
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

  function dateToBackendFormat(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  function consolidateFormDataTime(formData) {
    let hour = parseInt(formData.get('hour'));
    const minute = parseInt(formData.get('minutes'));
    const meridiem = formData.get('meridiem');
    if (hour === 12) {
      hour = 0;
    }

    if (meridiem === 'PM') {
      hour += 12;
    }

    const date = new Date(formData.get('date').replace('-', '/'));
    date.setHours(hour);
    date.setMinutes(minute);
    
    formData.delete('hour');
    formData.delete('minutes');
    formData.delete('meridiem');
    formData.set('date', dateToBackendFormat(date));
  }

  function formSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.target);
    util.consolidateFormDataTime(formData);
    util.requestPOST('/causes_api/createevent', formData)
      .then(res => {
        if (res.status === 200) {
          navigate('/orghome');
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
          <Card.Title>Create a New Event</Card.Title>
          <Card.Text style={{textAlign: "left"}}>
          <Form onSubmit={formSubmit}>
            <Form.Group>
              <Form.Label>Name of Event</Form.Label>
              <Form.Control placeholder="Enter event name" name='name'/>
            </Form.Group>

            <Form.Group>
              <Form.Label>Category of Event</Form.Label>
              <Form.Control placeholder="Enter event category" name='category' />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date and Time</Form.Label>
              <Form.Control placeholder="Enter event date" name='date' type='date' defaultValue={util.getCurrentDate()} />
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
              <Form.Control placeholder="Enter event description" name='description'/>
            </Form.Group>

            {error &&
              <Form.Group>
                <Form.Label className="error">{error}</Form.Label>
              </Form.Group>
            }
            <Form.Group className='mt-3'>
              {!loading &&
                <Button variant="outline-secondary" type="submit">
                  Create Event
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

export default CreateEvent;
