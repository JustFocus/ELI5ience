var ApiActions = require('../actions/api_actions');

var ApiUtil = {
  fetchUsers: function(){
    $.get('api/users', function(users){
      ApiActions.receiveAll(users);
    });
  },
  fetchUser: function(){
    $.get('api/users/:id', function(user){
      ApiActions.receiveAll(user);
    });
  },
  createUser: function(data){
    $.post('api/users', { user: data }, function(user) {
      ApiActions.receiveAll([user]);
    });
  }
  // TODO: Create Articles API
  // createArticle: function(data) {
  //   $.post('api/reviews', { review: data }, function (bench) {
  //     ApiActions.receiveAll([bench]);
  //   });
  // }
};

module.exports = ApiUtil;
