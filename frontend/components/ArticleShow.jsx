var React = require('react');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');
var ArticleForm = require('./ArticleForm');
var ArticleStore = require('../stores/article');
var CommentForm = require('./CommentForm');
var CommentIndex = require('./CommentIndex.jsx');

var ArticleShow = React.createClass({

	getInitialState: function() {
		var articleId = this.props.params.articleId;
		var article = this._findArticleById(articleId) || {comments:  []};
		return {article: article};
	},

	componentDidMount: function () {
		// TODO: only fetch articles if we don't have user info in _findArticleById
		this.articleListener = ArticleStore.addListener(this._onChange);
		ApiUtil.fetchArticles();
	},

	componentWillUnmount: function() {
		this.articleListener.remove();
	},

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			articleId: propUpdate.params.articleId,
			article: this._findArticleById(propUpdate.params.articleId)
		});
	},

	_onChange: function () {
		this.setState({
			article: this._findArticleById(this.props.params.articleId) || {}
		});
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

	render: function() {
		// var article = this.props.article;
		var handleClick = this.handleClick;
		return (
			<div>
				<br></br>
				<br></br>
				<div style={{backgroundColor: '#FFFFFF'}}>
					<h1>
						{this.state.article.title}
					</h1>
					<br></br>
					<br></br>
					{this.state.article.image_link}
					<br></br>
					{this.state.article.background_link}
					<br></br>
					<span>
						{this.state.article.locked}
						<br></br>
						<br></br>
						{this.state.article.username}
						<br></br>
						{this.state.article.expertise}
					</span>
				</div>
				<br></br>
				<br></br>
				<div style={{backgroundColor: '#FFFFFF'}}>
					<span style={{backgroundColor: '#FFFFFF'}}>
						{this.state.article.body}
					</span>
				</div>

				<br></br>
				<br></br>
				<div style={{backgroundColor: '#FFFFFF'}}>
					<span>
						<CommentForm articleId={this.props.params.articleId} />
					</span>
					<br></br>
					<br></br>
					<span>
						<CommentIndex comments={this.state.article.comments}/>
					</span>
				</div>
			</div>
		);
	}
});


module.exports = ArticleShow;
