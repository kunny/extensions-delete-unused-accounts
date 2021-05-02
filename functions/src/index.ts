import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import config from './config';

admin.initializeApp();

const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;
const MAX_CONCURRENT = 3;

/**
 * Run once a day at midnight, to cleanup the users
 * Manually run the task here https://console.cloud.google.com/cloudscheduler
 */
export const deleteInactiveAccounts = functions.handler.pubsub.schedule.onRun(async () => {
  // Fetch all user details.
  const inactiveUsers = await getInactiveUsers();

  // Use a pool so that we delete maximum `MAX_CONCURRENT` users in parallel.
  const promisePool = new PromisePool(() => deleteInactiveUser(inactiveUsers), MAX_CONCURRENT);
  await promisePool.start();

  console.log('User cleanup finished');
});

/**
 * Deletes one inactive user from the list.
 */
function deleteInactiveUser(inactiveUsers: Array<admin.auth.UserRecord>) {
  const userToDelete = inactiveUsers.pop();

  if (!userToDelete) {
      return;
  }
    
  // Delete the inactive user.
  return admin.auth().deleteUser(userToDelete.uid).then(() => {
    return console.log('Deleted user account', userToDelete.uid, 'because of inactivity');
  }).catch((error) => {
    return console.error('Deletion of inactive user account', userToDelete.uid, 'failed:', error);
  });
}

/**
 * Returns the list of all inactive users.
 */
async function getInactiveUsers(
    users: Array<admin.auth.UserRecord> = [], 
    nextPageToken: string | undefined = undefined,
) : Promise<Array<admin.auth.UserRecord>> {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  // Find users that have not signed in in the last 30 days.
  const inactiveUsers = result.users.filter(
      user => Date.parse(user.metadata.lastSignInTime) < (Date.now() - config.inactiveDays * 24 * 60 * 60 * 1000));
  
  // Concat with list of previously found inactive users if there was more than 1000 users.
  users = users.concat(inactiveUsers);
  
  // If there are more users to fetch we fetch them.
  if (result.pageToken) {
    return getInactiveUsers(users, result.pageToken);
  }
  
  return users;
}
