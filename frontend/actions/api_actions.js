var AppDispatcher = require('../dispatcher/dispatcher');
var UserConstants = require('../constants/user_constants');

var ApiActions = {
  receiveAll: function(users){
    AppDispatcher.dispatch({
      actionType: UserConstants.USER_RECEIVED,
      users: users
    });
  }
};

module.exports = ApiActions;
