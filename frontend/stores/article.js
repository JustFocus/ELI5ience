var Store = require('flux/utils').Store;
var ArticleConstants = require('../constants/article_constants');
var AppDispatcher = require('../dispatcher/dispatcher');

var ArticleStore = new Store(AppDispatcher);

var CHANGE_EVENT = "change";
var _articles = [];
var _user = [];
var _recentArticle = null;

var resetArticles = function(articles){
  _articles = articles.slice(0);
};

var resetUser = function(user){
  _user = [];
  _user = user;
};

var resetArticle = function(article){
	_articles.push(article);
  _recentArticle = article;
};

var removeArticle = function(article){
	//TODO: this - necessary? should _articles be [] or {}
	// _articles.
  // _articles = articles.slice(0);
};

var insertComment = function(comment) {
  _articles.forEach(function(article){
    if (article.id === comment.article_id) {
      article.comments.push(comment);
    }
  })
  return _articles;
};

ArticleStore.mostRecent = function() {
  return _recentArticle;
};

ArticleStore.all = function () {
  return _articles.slice(0);
};

ArticleStore.authors = function () {
  return _user;
};

ArticleStore.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case ArticleConstants.ARTICLES_RECEIVED:
      resetArticles(payload.articles);
      ArticleStore.__emitChange();
      break;
		case ArticleConstants.ARTICLE_RECEIVED:
			resetArticle(payload.article);
			ArticleStore.__emitChange();
			break;
		case ArticleConstants.ARTICLE_REMOVED:
			removeArticle(payload.article);
			ArticleStore.__emitChange();
			break;
    case ArticleConstants.USER_RECEIVED:
      resetUser(payload.user);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.COMMENT_RECEIVED:
      insertComment(payload.comment);
      ArticleStore.__emitChange();
      break;
  }
};

module.exports = ArticleStore;
