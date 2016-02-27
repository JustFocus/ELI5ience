var React = require('react');
var ReactRouter = require('react-router');
var ArticleStore = require('../stores/article');
var SessionStore = require('../stores/session');
var ApiUtil = require('../utils/api_util');

var User = React.createClass({

	getInitialState: function () {
    return {
			user: ArticleStore.authors(),
			articles: ArticleStore.all(),
			sessions: SessionStore.all()
		};
  },

	componentWillUnmount: function() {
		this.articleStoreListener.remove();
	},

	componentDidMount: function () {
		// this.articleStoreUserListener = ArticleStore.addListener();
		this.articleStoreListener = ArticleStore.addListener(this._onChange);
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchUser(this.props.params.userId);
		ApiUtil.fetchArticles();
		ApiUtil.fetchSessions();
		// ApiUtil.fetchArticles();
	},

	_onChange: function () {
		this.setState({
			articles: ArticleStore.all(),
			user: ArticleStore.authors(),
			sessions: SessionStore.all()
		 });
	},

	handleClick: function (article) {
		if (confirm("Are you sure you want to delete your " + article.title + " article?")) {
			this.articleStoreListener = ArticleStore.addListener(this._onChange);
			ApiUtil.removeArticle(article.id);
			ApiUtil.fetchArticles();
  	}
  },

	newArticleClick: function() {
		this.props.history.pushState(null, "articles/new");
	},

	render: function() {
		var handleClick = this.handleClick;
		var user = this.state.user;
		var delButton;

		return (
			<div>
				<br></br>
				<br></br>
				{this.state.user.username}
				<br></br>
				{this.state.user.expertise}
				<br></br>
				<br></br>

				<a
					className="btn btn-xs btn-primary"
					onClick={this.newArticleClick}
					role="button">
					Create article &raquo;
				</a>
				<br></br>
				<br></br>

				<ul>
					{this.state.user.username + "'s'"} Article List:
					<br></br>
					<br></br>

					{this.state.articles.map(function(article){
						var boundClick = handleClick.bind(null, article);
						if (article.author_id === this.state.user.id) {
							if (this.state.sessions.length > 0) {
								if ( this.state.sessions[0].id === this.state.user.id ) {
									delButton = <a
																className="btn btn-xs btn-danger"
																onClick={boundClick}
																article={article}
																role="button">
																Delete
															</a>;
								}
							}
							return (
								<li key={article.id}>{article.title + "    "}
									{delButton}
								</li>
							);
						}
					}.bind(this))}
				</ul>
			</div>
		);
	}
});


module.exports = User;
