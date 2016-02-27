var Store = require('flux/utils').Store;
var SessionConstants = require('../constants/article_constants');
var AppDispatcher = require('../dispatcher/dispatcher');

var SessionStore = new Store(AppDispatcher);

var _sessions = [];

var resetSessions = function(sessions){
  _sessions = sessions.slice(0);
};

SessionStore.all = function () {
  return _sessions.slice(0);
};

SessionStore.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case SessionConstants.SESSIONS_RECEIVED:
      resetSessions(payload.sessions);
      SessionStore.__emitChange();
      break;
  }
};

module.exports = SessionStore;
