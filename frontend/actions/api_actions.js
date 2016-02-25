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
};

module.exports = ApiActions;
