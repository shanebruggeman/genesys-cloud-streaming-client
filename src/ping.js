'use strict';

const DEFAULT_PING_INTERVAL = 20000;
const DEFAULT_MAXIMUM_FAILED_PINGS_BEFORE_DISCONNECT = 1;

module.exports = function (stanzaClient, options) {
  options = options || {};
  let pingInterval = options.pingInterval || DEFAULT_PING_INTERVAL;
  let failedPingsBeforeDisconnect = options.failedPingsBeforeDisconnect || DEFAULT_MAXIMUM_FAILED_PINGS_BEFORE_DISCONNECT;
  let numberOfFailedPings = 0;
  let pingIntervalId = null;

  function pingCallback (error, response) {
    if (response && !error) {
      numberOfFailedPings = 0;
    } else if (error) {
      console.warn('Missed a ping.');
      if (++numberOfFailedPings > failedPingsBeforeDisconnect) {
        console.error('Missed ' + numberOfFailedPings + ' pings, disconnecting');
        stanzaClient.sendStreamError('too many missed pongs');
      }
    }
  }

  function performPing () {
    stanzaClient.ping(options.jid, pingCallback);
  }

  return {
    start () {
      if (pingIntervalId === null) {
        pingIntervalId = setInterval(performPing, pingInterval);
      }
    },
    stop () {
      if (pingIntervalId !== null) {
        clearInterval(pingIntervalId);
        pingIntervalId = null;
      }
    }
  };
};