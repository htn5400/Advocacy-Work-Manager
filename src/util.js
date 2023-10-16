// 'use strict';

/* Makes a GET request to the backend.
 *
 * "path" is the absolute path of the requested resource, but it does not
 * include the host. (e.g. path should be '/causes_api/signin' not
 * 'localhost:3000/causes_api/signin').
 * 
 * "mimeType" is the expected MIME type of the backend's response. See
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 * for more info.
 */
async function requestGET(path, queryParams = null, mimeType = 'text/plain') {
  const response = await fetch(
    path + ((queryParams == null) ? '' : ('?' + new URLSearchParams(queryParams))),
    {
      method: 'GET',
      mode: 'same-origin',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': mimeType
      },
      referrerPolicy: 'no-referrer'
    }
  );

  return response;
}

/* Makes a POST request to the backend.
 *
 * "path" is the absolute path of the requested resource, but it does not
 * include the host. (e.g. path should be '/causes_api/signin' not
 * 'localhost:3000/causes_api/signin').
 * 
 * "data" is the already encoded data to be included in the POST request body.
 * 
 * "mimeType" is the expected MIME type of the backend's response. See
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 * for more info.
 */
async function requestPOST(path, data, mimeType = 'text/plain') {
  const response = await fetch(
    path,
    {
      method: 'POST',
      mode: 'same-origin',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': mimeType
      },
      referrerPolicy: 'no-referrer',
      body: data
    }
  );

  return response;
}

function formatDateTime(date) {
  const d = new Date(date);
  let timeString = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  timeString = (timeString.charAt(0) === '0') ? timeString.substring(1) : timeString;
  return d.toDateString() + ' at ' + timeString;
}

function dateAlreadyPassed(date) {
  const d = new Date(date);
  const now = new Date();
  console.log(d);
  console.log(now);
  console.log(d < now);
  console.log();
  return d < now;
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
  if (hour == 12) {
    hour = 0;
  }

  if (meridiem == 'PM') {
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

function cleanNumericInput(input, lower, upper, d) {
  let numeric = parseInt(input);
  if (!numeric)
    numeric = d;
  const cleaned = Math.max(Math.min(numeric, upper), lower).toString();
  return cleaned;
}

function hourInputChange(e) {
  e.target.value = cleanNumericInput(e.target.value, 1, 12, 1);
}

function minuteInputChange(e) {
  const minutes = cleanNumericInput(e.target.value, 0, 60, 0);
  e.target.value = (parseInt(minutes) < 10 ? '0' : '') + minutes;
}

function forwardPadZero(input) {
  return (input.length < 2 ? '0' + input : input)
}

function getCurrentDate() {
  const date = new Date();
  return date.getFullYear().toString() + '-'
          + forwardPadZero((date.getMonth()+1).toString())
          + '-' + forwardPadZero(date.getDate().toString())
}

export default {
  requestGET, requestPOST, formatDateTime, dateAlreadyPassed,
  consolidateFormDataTime, hourInputChange, minuteInputChange, getCurrentDate };
