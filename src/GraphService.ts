// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <graphServiceSnippet1>
import moment, { Moment } from 'moment';
import { Event } from 'microsoft-graph';
import { PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

var graph = require('@microsoft/microsoft-graph-client');

export interface Request {
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  id: string
}

export interface Presence {
  id: string,
  availability: string | "Available" | "Away" | "Busy" | "Offline" | "DoNotDisturb" | "PresenceUnknown",
  activity: string | "Available" | "Away" | "Offline" | "InAMeeting" | "Presenting" | "PresenceUnknown"
}


export interface User {
  id: string,
  businessPhones: string,
  displayName: string,
  givenName: string,
  mail: string,
  surname: string,
  userPrincipalName: string,
}

function getAuthenticatedClient(accessToken: string) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done: any) => {
      done(null, accessToken);
    }
  });

  return client;
}

export async function getUserDetails(accessToken: string) {
  const client = getAuthenticatedClient(accessToken);

  const user = await client
    .api('/me')
    .select('displayName,mail,mailboxSettings,userPrincipalName')
    .get();

  return user;
}

export async function getUsersDetails(accessToken: string, mails: string[]) {
  var requests: Array<Request> = mails.map(mail => (
    {
      url: `/users/${mail}`,
      method: "GET",
      id: mail
    }
  )
  )
  var response = await postBatch(accessToken, requests)
  var result: Array<User> = response.responses.map((res: any) => {
    if (res.status == 200) {
      return {
        id: res.body.id,
        businessPhones: res.body.businessPhones,
        displayName: res.body.displayName,
        givenName: res.body.givenName,
        mail: res.body.mail,
        surname: res.body.surname,
        userPrincipalName: res.body.userPrincipalName,
      }
    } else {
      return {
        id: res.id
      }
    }
  }
  )

  return result;

}
// </graphServiceSnippet1>

// <getUserWeekCalendarSnippet>
export async function getUserWeekCalendar(accessToken: string, timeZone: string, startDate: Moment): Promise<Event[]> {
  const client = getAuthenticatedClient(accessToken);

  // Generate startDateTime and endDateTime query params
  // to display a 7-day window
  var startDateTime = startDate.format();
  var endDateTime = moment(startDate).add(7, 'day').format();

  // GET /me/calendarview?startDateTime=''&endDateTime=''
  // &$select=subject,organizer,start,end
  // &$orderby=start/dateTime
  // &$top=50
  var response: PageCollection = await client
    .api('/me/calendarview')
    .header("Prefer", `outlook.timezone="${timeZone}"`)
    .query({ startDateTime: startDateTime, endDateTime: endDateTime })
    .select('subject,organizer,start,end')
    .orderby('start/dateTime')
    .top(50)
    .get();

  if (response["@odata.nextLink"]) {
    // Presence of the nextLink property indicates more results are available
    // Use a page iterator to get all results
    var events: Event[] = [];

    var pageIterator = new PageIterator(client, response, (event) => {
      events.push(event);
      return true;
    });

    await pageIterator.iterate();

    return events;
  } else {

    return response.value;
  }

}
// </getUserWeekCalendarSnippet>

// <createEventSnippet>
export async function createEvent(accessToken: string, newEvent: Event): Promise<Event> {
  const client = getAuthenticatedClient(accessToken);

  // POST /me/events
  // JSON representation of the new event is sent in the
  // request body
  return await client
    .api('/me/events')
    .post(newEvent);
}
// </createEventSnippet>


export async function getUserPresence(accessToken: string, id: string = ""): Promise<{}> {
  const client = getAuthenticatedClient(accessToken);

  var response = await client.api(`/users/${id}/presence`)
    .version('beta')
    .get();
  return response;
}

export async function getUsersPresence(accessToken: string, ids: Array<string>): Promise<Array<Presence>> {
  var requests: Array<Request> = ids.map(id => (
    {
      url: `/users/${id}/presence`,
      method: "GET",
      id: id
    }
  )
  )
  var response = await postBatch(accessToken, requests)

  var result: Array<Presence> = response.responses.map((res: { status: number; body: { id: any; availability: any; activity: any; }; id: any; }) => {
    if (res.status == 200) {
      return {
        id: res.body.id,
        availability: res.body.availability,
        activity: res.body.activity
      }
    } else {
      return {
        id: res.id,
        availability: "PresenceUnknown",
        activity: "PresenceUnknown"
      }
    }
  }
  )

  return result;
}




export async function postBatch(accessToken: string, requests: Array<Request>): Promise<{ [key: string]: any }> {
  const client = getAuthenticatedClient(accessToken);

  const $batch = { requests: requests };

  let response = await client.api('/$batch')
    .version('beta')
    .post($batch);

  return response;
}
