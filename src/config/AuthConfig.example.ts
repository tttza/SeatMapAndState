export const authConfig = {
  appId: 'YOUR_APP_ID_HERE',
  redirectUri: 'http://localhost:3000',
  scopes: [
    'user.read',
    'mailboxsettings.read',
    'calendars.readwrite',
    'Presence.Read',
    'Presence.Read.All',
    'User.ReadBasic.All'
  ]
};
