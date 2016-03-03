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
var removeComment = function(comment){
	//TODO: this - necessary? should _articles be [] or {}
	// _articles.
  // _articles = articles.slice(0);
};
var findAnnotationById = function(id){
  for (var i = 0; i < _articles.length; i++) {
    for (var j = 0; j < _articles[i].annotations.length; j++) {
      if (_articles[i].annotations[j].id === id) {
        return [i, j];
      }
    }
  }
};

var removeImprovement = function(improvement){
  var articleAnnotation = findAnnotationById(improvement.annotation_id);
  for (var i = 0; i < _articles[articleAnnotation[0]].annotations[articleAnnotation[1]].improvements.length; i++) {
    if (_articles[articleAnnotation[0]].annotations[articleAnnotation[1]].improvements[i].id === improvement.id)  {
      delete _articles[articleAnnotation[0]].annotations[articleAnnotation[1]].improvements[i];
      return _articles;
    }
  }
  return _articles;
};

var removeAnnotation = function(annotation){
	//TODO: this - necessary? should _articles be [] or {}
	// _articles.
  // _articles = articles.slice(0);
};

var insertComments = function(comments) {
  if (comments.length === 0) return _articles;
  _articles.forEach(function(article){
    if (article.id === comments[0].article_id) {
      article.comments = comments;
    }
  });
  return _articles;
};

var insertAnnotations = function(annotations) {
  _articles.forEach(function(article){
    if (article.id === annotations[0].article_id) {
      article.annotations = annotations;
    }
  });
  return _articles;
};

var insertComment = function(comment) {
  _articles.forEach(function(article){
    if (article.id === comment.article_id) {
      article.comments.push(comment);
    }
  });
  return _articles;
};

var insertImprovement = function(improvement) {
  var articleAnnotation = findAnnotationById(improvement.annotation_id);
  for (var i = 0; i < _articles[articleAnnotation[0]].annotations.length; i++) {
    if (_articles[articleAnnotation[0]].annotations[i].id === improvement.annotation_id)  {
      _articles[articleAnnotation[0]].annotations[i].improvements.push(improvement);
      return _articles;
    }
  }
  return _articles;
};

var insertAnnotation = function(annotation) {
  _articles.forEach(function(article){
    if (article.id === annotation.article_id) {
      article.annotations.push(annotation);
    }
  });
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
    case ArticleConstants.COMMENTS_RECEIVED:
      insertComments(payload.comments);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.COMMENT_RECEIVED:
      insertComment(payload.comment);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.COMMENT_REMOVED:
      removeComment(payload.comment);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.IMPROVEMENT_RECEIVED:
      insertImprovement(payload.improvement);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.IMPROVEMENT_REMOVED:
      removeImprovement(payload.improvement);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.ANNOTATION_RECEIVED:
      insertAnnotation(payload.annotation);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.ANNOTATIONS_RECEIVED:
      insertAnnotations(payload.annotations);
      ArticleStore.__emitChange();
      break;
    case ArticleConstants.ANNOTATION_REMOVED:
      removeAnnotation(payload.annotation);
      ArticleStore.__emitChange();
      break;
  }
};

module.exports = ArticleStore;
