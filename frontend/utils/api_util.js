var ApiActions = require('../actions/api_actions');

var ApiUtil = {
  // TODO: Users API?
  // fetchUsers: function(){
  //   $.get('api/users', function(users){
  //     ApiActions.receiveAll(users);
  //   });
  // },
  // fetchUser: function(){
  //   $.get('api/users/:id', function(user){
  //     ApiActions.receiveAll(user);
  //   });
  // },
  // createUser: function(data){
  //   $.post('api/users', { user: data }, function(user) {
  //     ApiActions.receiveAll([user]);
  //   });
  // }
  createAnnotation: function(data) {
    $.post('api/annotations', { annotation: data }, function (annotations) {
      ApiActions.receiveAnnotations(annotations);
    });
  },
  removeAnnotation: function(id) {
    $.ajax({
      url: 'api/annotations/' + id,
      type: 'DELETE',
      success: function(annotations){
        ApiActions.receiveAnnotations(annotations);
      }
    });
  },
  updateAnnotation: function(data) {
    $.ajax({
      url: 'api/annotations/' + data.id,
      data: data,
      type: 'DELETE',
      success: function(annotations){
        ApiActions.receiveAnnotations(annotations);
      }
    });
  },

  createComment: function(data) {
    $.post('api/comments', { comment: data }, function (comments) {
      ApiActions.receiveComments(comments);
    });
  },
  removeComment: function(id) {
    $.ajax({
      url: 'api/comments/' + id,
      type: 'DELETE',
      success: function(comments){
        ApiActions.receiveComments(comments);
      }
    });
  },

  fetchSessions: function() {
    $.get('api/session', function(sessions){
      ApiActions.receiveSessions(sessions);
    });
  },

  createArticle: function(data) {
    $.post('api/articles', { article: data }, function (article) {
      ApiActions.receiveSingle(article);
    });
  },
  fetchArticles: function() {
    $.get('api/articles', function(articles){
      ApiActions.receiveAll(articles);
    });
  },
  fetchArticle: function(id) {
    $.get('api/articles/' + id, function(article){
      ApiActions.receiveSingle(article);
    });
  },
  removeArticle: function(id) {
    $.ajax({
      url: 'api/articles/' + id,
      type: 'DELETE',
      success: function(article){
        ApiActions.removeSingle(article);
      }
    });
  },
  updateArticle: function(data) {
    $.ajax({
      url: 'api/articles/' + data.id,
      data: {article: data.params},
      type: 'PATCH',
      success: function(article){
        ApiActions.receiveSingle(article);
      }
    });
  },

  fetchUser: function(id) {
    $.get('api/users/' + id, function(user){
      ApiActions.receiveSingleUser(user);
    });
  },
};

module.exports = ApiUtil;
