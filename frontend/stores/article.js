var Store = require('flux/utils').Store;
var ArticleConstants = require('../constants/article_constants');
var AppDispatcher = require('../dispatcher/dispatcher');

var ArticleStore = new Store(AppDispatcher);

var CHANGE_EVENT = "change";
var _articles = {};
var _users = [];

var resetArticles = function(articles){
  _articles = {};
  for (var i = 0; i < articles.keys.length; i++) {
    _articles[articles[id]] = articles[id];
  }
  return _articles
};

var resetUser = function(user){
  _users = [];
  _users = user;
};

var resetArticle = function(article){
	_articles[article[id]] = article;
};

var removeArticle = function(article){
	//TODO: this - necessary? should _articles be [] or {}
	// _articles.
  // _articles = articles.slice(0);
};

ArticleStore.mostRecent = function() {
  return _recentArticle;
};

ArticleStore.all = function () {
  return _articles.slice(0);
};

ArticleStore.authors = function () {
  return _users;
};

ArticleStore.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case ArticleConstants.ARTICLES_RECEIVED:
      var result = resetArticles(payload.articles);
      ArticleStore.__emitChange();
      break;
		case ArticleConstants.ARTICLE_RECEIVED:
			result = resetArticle(payload.article);
			ArticleStore.__emitChange();
			break;
		case ArticleConstants.ARTICLE_REMOVED:
			result = removeArticle(payload.article);
			ArticleStore.__emitChange();
			break;
    case ArticleConstants.USER_RECEIVED:
      result = resetUser(payload.user);
      ArticleStore.__emitChange();
      break;
  }
};

module.exports = ArticleStore;
