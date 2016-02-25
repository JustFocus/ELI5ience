var React = require('react');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');
var ArticleForm = require('./ArticleForm');
var ArticleStore = require('../stores/article');


var ArticleShow = React.createClass({

	getInitialState: function() {
		var articleId = this.props.params.articleId;
		var authorId = null;
		var article = this._findArticleById(articleId) || {};
		var author = this._findAuthorById(authorId) || {};
		return {article: article, author: author};
	},

	componentDidMount: function () {
		this.authorListener = ArticleStore.addListener(this._onChange);
		ApiUtil.fetchUser();
	},

	componentWillUnmount: function() {
		this.authorListener.remove();
	},

	_onChange: function () {
		this.setState({ author: ArticleStore.authors() });
	},

	_findArticleById: function(id) {
		var foundArticle;
		ArticleStore.all().forEach(function (article) {
			if (id == article.id) {
				foundArticle = article;
			}
		}.bind(this));
		return foundArticle;
	},

	_findAuthorById: function(authorId) {
		var foundAuthor;
		ArticleStore.authors().forEach(function (author) {
			if (authorId == this.state.article.author_id) {
				foundAuthor = author;
			}
		}.bind(this));
		return foundAuthor;
	},

	render: function() {
		var article = this.props.article;

		return (
			<div style={{backgroundColor: '#FFFFFF'}}>
				<br></br>
				<br></br>
				{this.state.article.title}
				<br></br>
				<br></br>
				{this.state.article.body}
				<br></br>
				<br></br>
				{this.state.article.image_link}
				<br></br>
				{this.state.article.background_link}
				<br></br>
				{this.state.article.author_id}
				<br></br>
				{this.state.article.locked}
			</div>
		);
	}
});


module.exports = ArticleShow;
