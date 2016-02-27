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
  receiveSessions: function(sessions){
    AppDispatcher.dispatch({
      actionType: ArticleConstants.SESSIONS_RECEIVED,
      sessions: [sessions]
    });
  },
};

module.exports = ApiActions;
