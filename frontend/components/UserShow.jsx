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
		this.sessionStoreListener.remove();
	},

	componentDidMount: function () {
		this.articleStoreListener = ArticleStore.addListener(this._onChange);
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchUser(this.props.params.userId);
		ApiUtil.fetchArticles();
		ApiUtil.fetchSessions();
	},

	_onChange: function () {
		this.setState({
			articles: ArticleStore.all(),
			user: ArticleStore.authors(),
			sessions: SessionStore.all()
		 });
	},

	handleDelClick: function (article) {
		if (confirm("Are you sure you want to delete your " + article.title + " article?")) {
			this.articleStoreListener = ArticleStore.addListener(this._onChange);
			ApiUtil.removeArticle(article.id);
			ApiUtil.fetchArticles();
  	}
  },

	handleArticleClick: function(article) {
		this.props.history.pushState(null, "articles/" + article.id );
	},

	newArticleClick: function() {
		this.props.history.pushState(null, "articles/new");
	},

	createButton: function() {
		if (this.state.sessions.length > 0) {
			if ( this.state.sessions[0].id === this.state.user.id ) {
				return <a
					className="btn btn-xs btn-success user-create-art"
					onClick={this.newArticleClick}
					role="button">
					Create article &raquo;
				</a>;
			}
		}
	},

	render: function() {
		var handleDelClick = this.handleDelClick;
		var handleArticleClick = this.handleArticleClick;
		var user = this.state.user;
		var delButton;

		return (
			<div>
				<br></br>
				<br></br>


				<div className="panel-heading user-pro-panel-heading">
					<h3 className="panel-title">User Info:</h3>
						<br></br>

	      <div className="row">
	        <div className="col-sm-4">
	          <ul className="list-group">
	            <li className="list-group-item user-list"><strong>Username:</strong> {this.state.user.username}</li>
	            <li className="list-group-item user-list"><strong>Expertise:</strong> {this.state.user.expertise}</li>
	          </ul>
					</div>
				</div>
			</div>

				<br></br>
				<div className="ELI-panel">
					<div className="panel panel-primary user-panel-primary">
							<div className="panel-heading user-panel-heading">
								<h3 className="panel-title">{this.state.user.username + "'s"} Articles:</h3>
							</div>
							<div className="panel-body">
								{this.createButton()}
								<div className="list-group">
									{this.state.articles.map(function(article){
										var boundDelClick = handleDelClick.bind(null, article);
										var boundArticleClick = handleArticleClick.bind(null, article);
										if (article.author_id === this.state.user.id) {
											if (this.state.sessions.length > 0) {
												if ( this.state.sessions[0].id === this.state.user.id ) {
													delButton =
													<a
														className="btn btn-xs btn-danger user-del"
														onClick={boundDelClick}
														article={article}
														role="button"
													>
														Delete
													</a>;
												}
											}
											return (
												<div key={article.id}>
													{delButton}
													<a
														href={"#/articles/" + article.id}
														onClick={this.boundArticleClick}
													>
														{" " + article.title}
													</a>
												</div>
											);
										}
									}.bind(this))}
								</div>
							</div>
					</div>
				</div>
			</div>
		);
	}
});


module.exports = User;
