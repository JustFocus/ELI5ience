var AppDispatcher = require('../dispatcher/dispatcher');
var ArticleConstants = require('../constants/article_constants');

var ApiActions = {
  receiveAll: function(articles){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ARTICLES_RECEIVED,
      articles: articles
    });
  },
  receiveSingle: function(article){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ARTICLE_RECEIVED,
      article: article
    });
  },
  removeSingle: function(article){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ARTICLE_REMOVED,
      article: article
    });
  },
  receiveSingleUser: function(user){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.USER_RECEIVED,
      user: user
    });
  },
  receiveSingleComment: function(comment){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.COMMENT_RECEIVED,
      comment: comment
    });
  },
  receiveComments: function(comments){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.COMMENTS_RECEIVED,
      comments: comments
    });
  },
  removeSingleComment: function(comment){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.COMMENT_REMOVED,
      comment: comment
    });
  },
  receiveSessions: function(sessions){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.SESSIONS_RECEIVED,
      sessions: [sessions]
    });
  },
  receiveSingleAnnotation: function(annotation){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ANNOTATION_RECEIVED,
      annotation: annotation
    });
  },
  receiveAnnotations: function(annotations){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ANNOTATIONS_RECEIVED,
      annotations: annotations
    });
  },
  removeSingleAnnotation: function(annotation){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.ANNOTATION_REMOVED,
      annotation: annotation
    });
  },
};

module.exports = ApiActions;
