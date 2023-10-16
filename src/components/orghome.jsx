import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container'
import { NotFound } from ".";
import { COLORS } from './colors.js';
import util from "../util";

function OrgHome() {

  const [orgData, setOrgData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [createEvent, setCreateEvent] = useState(false);
  const [error, setError] = useState(null);
  const [signUpOrg, setSignUpOrg] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    renderOrganization();
  });

  /* function getQueryParams
   *
   * Returns the name of the organization
   */
  function getQueryParams() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    return params.org;
  }

  function renderOrganization() {
    // do not re-render if data already rendered
    if (orgData != null || error != null)
      return;

    setOrgData(false);
    setEventData(false);

    const orgParam = getQueryParams();
    const getParams = orgParam != null ? { 'org' : orgParam } : null;

    util.requestGET(
      '/causes_api/get_org_full', getParams, 'application/json'
    ).then(res => {
      if (res.status === 200) {
        res.json().then(body => {
          const orgData = body['org_info'];
          const orgEvents = body['events'];
          const user = body['user'];

          setOrgData(orgData);
          const upcomingEvents =
            orgEvents.filter(e => !util.dateAlreadyPassed(e.date));
          const passedEvents = orgEvents.filter(e => util.dateAlreadyPassed(e.date));
          setEventData({'upcoming' : upcomingEvents, 'passed' : passedEvents});

          if (orgParam == null) {
            // We are displaying logged-in organization
            setCreateEvent(true);
          } else if ('volunteer' in user) {
            setSignUpOrg(!user.volunteer.orgs.includes(orgParam));
          }
        });
      } else if (res.status === 401) {
        navigate('/');
        setOrgData(null);
      } else {
        setError(404);
        setOrgData(null);
      }
    });
  }

  /* function followVol
   *
   * Makes request to backend to sign logged-in volunteer user up
   * for this organization.
   */
  function followOrg() {
    const orgParam = getQueryParams();
    const body = JSON.stringify({'org' : orgParam});

    util.requestPOST('/causes_api/vol_org_link', body).then(res => {
      if (res.status === 200) {
        setSignUpOrg(false);
      } else {
        // TODO: change this
        alert("Something went wrong.");
      }
    });
  }

  /* function unfollowVol
   *
   * Makes request to backend to sign logged-in volunteer user up
   * for this organization.
   */
  function unfollowOrg() {
    const orgParam = getQueryParams();
    const body = JSON.stringify({'org' : orgParam});

    util.requestPOST('/causes_api/vol_org_unlink', body).then(res => {
      if (res.status === 200) {
        setSignUpOrg(true);
      } else {
        // TODO: change this
        alert("Something went wrong.");
      }
    });
  }

  return (
    <div className= "body">
      <Container style={{width: 1300}}>
      {orgData &&
        <div>
          <div className="orginfo">
            <h1>{orgData.name}</h1>
            <h4>{orgData.category}</h4>
            <Row>
              <Col style={{textAlign: 'left' }}>
              <h3>About Us</h3>
              </Col>
              <Col style={{textAlign: 'right' }}>
                {signUpOrg &&
                <Button variant="outline-secondary" style={{marginTop: 15 }} onClick={followOrg}>
                  Follow
                </Button>
                }
                {signUpOrg === false &&
                <Button variant="outline-secondary" style={{marginTop: 15 }} onClick={unfollowOrg}>
                  Unfollow
                </Button>
                }
              </Col>
            </Row>
            
            <p style={{textAlign: 'left' }}>{orgData.bio}</p>
          </div>
          <Row className ="my-3">
          <Col style={{textAlign: 'left' }}>
          <h3>Upcoming Events</h3>
          </Col>
          <Col style={{textAlign: 'right' }}>
          {createEvent && (<Link to="/createevent">
          <Button variant="outline-secondary" type="submit" style={{marginTop: 15 }}>
              + Add Event
          </Button>
          </Link>)}
          </Col>
          </Row>

          <Container>
            {eventData &&
            eventData.upcoming.map(event => {
              return (
                <Row>
                  <Card style={{backgroundColor : COLORS.lightorange}} className = "my-2" key={'org:' + orgData.name + '&event:' + eventData.name}>
                  <Link to={"/eventhome?org="+ orgData.name + "&"+ new URLSearchParams({"event": event.name})} style={{ textDecoration: 'none' }}>
                  <Card.Body>
                    <Card.Title>{event.name}</Card.Title>
                    <Card.Text>
                      { util.formatDateTime(event.date) }
                    </Card.Text>
                    <Card.Text>
                      {event.description}
                    </Card.Text>               
                  </Card.Body>
                  </Link>
                </Card>
                </Row>
              );
            })
          }
          </Container>
          
          
          <div className = "Past Events" style={{paddingTop: '20px', paddingBottom: '20px'}}>
            <h3 style={{textAlign: 'left' }}>Past Events</h3>
            
            <Container>
            {eventData &&
              eventData.passed.slice().reverse().map(event => {
                return (
                  <Row>
                  <Card style={{backgroundColor : COLORS.lightorange}}  key={'org:' + orgData.name + '&event:' + eventData.name}>
                    <Link to={"/eventhome?org="+ orgData.name + "&"+ new URLSearchParams({"event": event.name})} style={{ textDecoration: 'none', color: COLORS.darkorange}}>

                    <Card.Body>
                      <Card.Title>{event.name}</Card.Title>
                      
                      <Card.Text>
                        { util.formatDateTime(event.date) }
                      </Card.Text>
                      <Card.Text>
                        {event.description}
                      </Card.Text>
                    </Card.Body>
                    </Link>
                  </Card>
                  </Row>
                );
              })
            }
            </Container>
            
          </div>
        </div>
      }
      {orgData === false &&
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

export default OrgHome;
