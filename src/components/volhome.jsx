import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import { NotFound } from ".";
import util from "../util";
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Link } from "react-router-dom";
import { COLORS } from './colors.js';

function VolHome() {

  const [data, setData] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    renderVolunteer();
  });

  function getQueryParams() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    return params.org;
  }

  function renderVolunteer() {
    // do not re-render if data already rendered
    if (data != null || error != null)
      return;
    
    setData(false);
    setOrgData(false);
    setEventData(false);
    setTaskData(false);

    const volParam = getQueryParams();
    const getParams = volParam != null ? { 'volunteer' : volParam } : null;
    
    util.requestGET(
      '/causes_api/get_user', getParams, 'application/json'
    ).then(res => {
      if (res.status === 200) {
        res.json().then(body => {
          if ('volunteer' in body) {  //check if logged in as volunteer
            const volData = body['volunteer'];
            const volOrgs = volData['orgs'];
            const volEvents = volData['events'];
            const volTasks = volData['tasks'];

            setLoaded(true);
            setData(volData);
            setOrgData(volOrgs);
            setEventData(volEvents);
            setTaskData(volTasks);
          } else {   // case where logged in as org
            navigate('/orghome');
          }
        });
      } else if (res.status === 401) {
        navigate('/');
        setData(null);
      } else {
        setLoaded(true);
        setError(404);
        setData(null);
      }
    });
  }

  return (
    <div className= "body">
      <Container style={{width: 1300}}>

      {data &&  //       {JSON.stringify(data)}
        <div className="home">
          <div className="volinfo">
            <h1>Welcome, { data.name }</h1>
            <p>{ data.bio }</p>
          </div>


          <div className = "Organizations">
          <h3>My Organizations</h3> 
          <Container>
            <Row>
            {orgData &&
              orgData.map(org => {
                return (
                  <Col xs="4">
                  <Card style={{backgroundColor : COLORS.lightblue}} className = "my-2" key={'org:' + org} >
                    <Card.Body>
                      <Link style={{textDecoration: 'none', color : COLORS.darkblue}} to={"/orghome?org="+ org}>
                      <Card.Title>{org}</Card.Title>
                      </Link>
                    </Card.Body>
                  </Card>
                  </Col>
                );
              })
            }
            </Row>
          </Container>
          </div>

          <div className = "Events">
          <h3>My Events</h3> 
          <Container>
            <Row>
            {eventData &&
              eventData.map(event => {

                const eventParams = {
                  'event' : event.name,
                  'org' : event.org
                }

                return (
                  <Col xs="4">
                  <Card style={{backgroundColor : COLORS.lightorange}} className ="my-2" key={'org:' + event.org + 'event:' + event.name}>
                    <Card.Body>
                      <Link style={{textDecoration: 'none', color : COLORS.darkorange}} to={"/eventhome?" + new URLSearchParams(eventParams)}> 
                      <Card.Title>{event.name}</Card.Title>
                      </Link>
                    </Card.Body>
                  </Card>
                  </Col>
                );
              })
            }
            </Row>
          </Container>
          </div> 

          <div className = "Tasks">
          <h3>My Tasks</h3> 
          <Container>
            <Row>
            {taskData &&
              taskData.map(task => {
                const taskParams = {
                  'event' : task.event,
                  'org' : task.org
                }

                return (
                  <Col xs="4">
                  <Card style={{backgroundColor : COLORS.lightred}} key={'org:' + task.org + 'event:' + task.event + 'task:' + task.name}>
                    <Card.Body>
                      <Link style={{textDecoration: 'none', color : COLORS.darkred}} to={"/eventhome?" + new URLSearchParams(taskParams)}>
                      <Card.Title>{task.name}</Card.Title>
                      </Link>
                    </Card.Body>
                  </Card>
                  </Col>
                );
              })
            }
            </Row>
          </Container>
          </div>

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

export default VolHome;


