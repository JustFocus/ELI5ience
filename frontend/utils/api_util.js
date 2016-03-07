var ApiActions = require('../actions/api_actions');

var ApiUtil = {
  createAnnotation: function(data) {
    $.post('api/annotations', { annotation: data }, function (annotations) {
      ApiActions.receiveAnnotations(annotations);
    });
  },
  removeAnnotation: function(id) {
    $.ajax({
      url: 'api/annotations/' + id,
      type: 'DELETE',
      success: function(annotation){
        ApiActions.removeSingleAnnotation(annotation);
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
    $.post('api/comments', { comment: data }, function (comment) {
      ApiActions.receiveSingleComment(comment);
    });
  },
  removeComment: function(id) {
    $.ajax({
      url: 'api/comments/' + id,
      type: 'DELETE',
      success: function(comment){
        ApiActions.removeSingleComment(comment);
      }
    });
  },
  createImprovement: function(data) {
    $.post('api/improvements', { improvement: data }, function (improvement) {
      ApiActions.receiveSingleImprovement(improvement);
    });
  },
  removeImprovement: function(id) {
    $.ajax({
      url: 'api/improvements/' + id,
      type: 'DELETE',
      success: function(improvement){
        ApiActions.removeSingleImprovement(improvement);
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
