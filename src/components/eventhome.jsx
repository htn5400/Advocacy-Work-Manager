import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container'
import { COLORS } from './colors.js';
import { NotFound } from ".";
import util from "../util";

function EventHome() {
  const [eventData, setEventData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [createTask, setCreateTask] = useState(false);
  const [error, setError] = useState(null);
  const [signUpEvent, setSignUpEvent] = useState(null);
  const [signUpTask, setSignUpTask] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    renderEvent();
  });

  /* function getQueryParams
   *
   * Returns a JavaScript object containing
   *   'org', the name of the organization that organizes this event
   *   'event', the name of the event
   */
  function getQueryParams() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    const orgParam = params.org;
    const eventParam = params.event;

    const queryParams = {
      'org' : orgParam,
      'event' : eventParam
    };

    return queryParams;
  }

  /* function renderEvent
   *
   * Fetches and displays the correct event. Parses the organization name
   * and event name from the query parameters, fetches the event data,
   * and constructs the JSX for the event. Finally, calls setData() to
   * display the event.
   *
   * Both organization and event must be specified in the query parameters
   * for this page.
   */
  function renderEvent() {
    // do not re-render if data already rendered
    if (eventData != null || error != null)
      return;

    setEventData(false);
    setTaskData(false);
    setLoaded(true);
    setCreateTask(false)

    const queryParams = getQueryParams();

    if (queryParams['org'] == null || queryParams['event'] == null) {
      // Both org and event needed to find resource
      // setLoaded(true);
      setError(<NotFound />);
      return;
    }

    util.requestGET(
      '/causes_api/get_event', queryParams, 'application/json'
    ).then(res => {
      if (res.status === 200) {
        res.json().then(body => {
          const orgEvent = body['event_info'];
          const eventSignedUp = body['eventSignedUp'];
          const user = body['user'];
          const eventTask = body['task'];

          setEventData(orgEvent);
          setTaskData(eventTask);

          if (user.organization != null && user.organization.name === queryParams['org'] ) {
            setCreateTask(true)
          } 

          setSignUpEvent('volunteer' in user ? !eventSignedUp : null);

          //volunteers can sign up for events and tasks
          if ('volunteer' in user) {
            const tasks_signed_up = {};
            eventTask.forEach(task => {
              tasks_signed_up[task.name] = task.signedUp;
            });
            setSignUpTask(tasks_signed_up);
          }
        });
      } else if (res.status === 401) {
        navigate('/');
      } else {
        setError(404);
      }
       
    });
  }

   /* function goingEvent
   *
   * Makes request to backend to sign logged-in volunteer user up
   * for this event.
   */
   function goingEvent() {
    const queryParams = getQueryParams();
    const body = JSON.stringify({'event' : queryParams['event'], 'org' : queryParams['org'] });

    util.requestPOST('/causes_api/vol_event_link', body).then(res => {
      if (res.status === 200) {
        setSignUpEvent(false);
      } else {
        // TODO: change this
        alert("Something went wrong.");
      }
    });
  }

  function notGoingEvent() {
    const queryParams = getQueryParams();
    const body = JSON.stringify({'event' : queryParams['event'], 'org' : queryParams['org']});

    util.requestPOST('/causes_api/vol_event_unlink', body).then(res => {
      if (res.status === 200) {
        setSignUpEvent(true);
      } else {
        // TODO: change this
        alert("Something went wrong.");
      }
    });
  }

     /* function doTask
   *
   * Makes request to backend to sign logged-in volunteer user up
   * for this event.
   */
    function doingTask(taskName) {
      const queryParams = getQueryParams();
      const body = JSON.stringify({'task' : taskName, 'event' : queryParams['event'], 'org' : queryParams['org']});
  
      util.requestPOST('/causes_api/vol_task_link', body).then(res => {
        if (res.status === 200) {
          setSignUpTask( task_info => ({
            ...task_info,
            [taskName] : true
          }));

        } else {
          // TODO: change this
          alert("Something went wrong.");
        }
      });
    }
  
    function notDoingTask(taskName) {
      const queryParams = getQueryParams();
      const body = JSON.stringify({'task' : taskName,'event' : queryParams['event'], 'org' : queryParams['org']});
  
      util.requestPOST('/causes_api/vol_task_unlink', body).then(res => {
        if (res.status === 200) {
          setSignUpTask( task_info => ({
            ...task_info,
            [taskName] : false
          }));
        } else {
          // TODO: change this
          alert("Something went wrong.");
        }
      });
    }

  return (
    <div className="body">
      <Container style={{width: 1300}}>
      {eventData &&
        <div className="eventinfo">
          <h1>{ eventData.eventName }</h1>
          <h4>Organized by { eventData.orgName }</h4>
          <h3>{ util.formatDateTime(eventData.date) }</h3>
          <Row>
            <Col style={{textAlign: 'left' }}>
            <h4>{ eventData.category }</h4>
            </Col>
            <Col style={{textAlign: 'right' }}>
              {signUpEvent &&
              <div>
                <Button variant="outline-secondary" style={{marginTop: 15 }} onClick={goingEvent}>
                Register
                </Button>
              </div>
              }
              {signUpEvent === false &&
              <div>
                <Button variant="outline-secondary" style={{marginTop: 15 }} onClick={notGoingEvent}>
                Deregister
              </Button>
              </div>
              }
            </Col>
          </Row>
          <p style={{textAlign: 'left' }}>{ eventData.bio }</p>

          <Row className ="my-3">
            <Col style={{textAlign: 'left' }}>
            <h3>Tasks</h3>
            </Col>
            <Col style={{textAlign: 'right' }}>
            {createTask && (<Link to={"/createtask?" +  new URLSearchParams({"event" : eventData.eventName})} >
            <Button variant="outline-secondary" type="submit" style={{marginTop: 15 }}>
                + Add Task
            </Button>
            </Link>)}
            </Col>
          </Row>
          <Container>
            <Row>
            {taskData &&
            taskData.map(task => {
              return (
                <Col sm="6">
                <Card className = "my-2" style={{backgroundColor : COLORS.lightred}} key={'org:' + eventData.orgName + '&event:' + eventData.eventName + '&task' + task.name}>
                  <Card.Body>
                    <Card.Title>
                    <Row>
                    <Col className ="align-self-center" style={{textAlign: 'left' }}>{task.name}</Col>
                    <Col className ="align-self-center" style={{textAlign: 'center' }}>{util.formatDateTime(task.date)}</Col>
                    <Col className ="align-self-center" style={{textAlign: 'right' }}>
                    {signUpTask !== null && signUpTask[task.name] === false &&
                      <Button variant="outline-secondary" onClick={() => {doingTask(task.name)}}>
                        Sign Up
                      </Button>
                    }
                    {signUpTask !== null && signUpTask[task.name] === true &&
                      <Button variant="outline-secondary" onClick={() => {notDoingTask(task.name)}}>
                        Withdraw
                      </Button>
                    }
                    </Col>
                    </Row>
                    </Card.Title>
                    <Card.Text>
                      {task.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
                </Col>
              );
            })
          }
            </Row>
          </Container>
          
        </div>
      }
      {!loaded &&
        <div className="my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      }
      {error === 404 &&
        <NotFound />
      }

      </Container>
    </div>
  );
}

export default EventHome;
