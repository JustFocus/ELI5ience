var React = require('react');
var ReactRouter = require('react-router');
var ArticleStore = require('../stores/article');
var ApiUtil = require('../utils/api_util');

var User = React.createClass({

	getInitialState: function () {
    return {
			user: ArticleStore.authors(),
			articles: ArticleStore.all()
		};
  },

	componentWillUnmount: function() {
		this.articleStoreListener.remove();
	},

	componentDidMount: function () {
		this.articleStoreListener = ArticleStore.addListener(this._onChange);
		ApiUtil.fetchArticles();
		ApiUtil.fetchUser(this.props.params.userId);
	},

	_onChange: function () {
		this.setState({
			articles: ArticleStore.all(),
			user: ArticleStore.authors()
		 });
	},

	handleClick: function (article) {
		if (confirm("Are you sure you want to delete your " + article.title + " article?")) {
			this.articleStoreListener = ArticleStore.addListener(this._onChange);
			ApiUtil.removeArticle(article.id);
			ApiUtil.fetchArticles();
  	}
  },

	render: function() {
		var handleClick = this.handleClick;
		return (
			<div>
				<br></br>
				<br></br>
				{this.state.user.username}
				<br></br>
				{this.state.user.expertise}
				<br></br>

				<br></br>
				<ul>
					{this.state.user.username + "'s'"} Article List
					{this.state.articles.map(function(article){
						var boundClick = handleClick.bind(null, article);
						return (
							<li key={article.id}>{article.title + "    "}
								<a
									className="btn btn-xs btn-danger"
									onClick={boundClick}
									article={article}
									role="button">
									Delete
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
});


module.exports = User;
