var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ArticleStore = require('../stores/article');
var SessionStore = require('../stores/session');

var ArticleForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      title: "",
      body: "",
			imageLink: "",
			backgroundLink: "",
			backgroundLink2: "",
			article: null,
			session: SessionStore.all()
    };
  },

	handleSubmit: function(event){
		event.preventDefault();
		var article = {
			title: this.state.title,
			body: this.state.body,
			image_link: this.state.imageLink,
			background_link: this.state.backgroundLink,
			background_link2: this.state.backgrundLink2
		};
		ApiUtil.createArticle(article);
		this.createListener = ArticleStore.addListener(this.navigateToArticle);
	},
	componentDidMount: function () {
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchSessions();
	},
	componentWillUnmount: function() {
		this.sessionStoreListener.remove();
		if (this.createListener) {
			this.createListener.remove();
		}
	},
	_onChange: function () {
		this.setState({ session: SessionStore.all()});
		// this.navigateToArticle();
  },
	navigateToArticle: function(){
		this.setState({ article: ArticleStore.mostRecent() });
		this.props.history.pushState(
			null,
			"articles/" + this.state.article.id
		);
	},
	navigateToHome: function(){
		this.props.history.pushState(null, "/");
	},
	handleCancel: function(event){
		event.preventDefault();
		this.navigateToHome();
	},
	createBtn: function(session){
		if (session.length === 0) {
			return <div className='errlogin'><a href='./session/new'>Login to create an article!</a></div>;
		} else {
			return (
				<input
					className="btn btn-xs btn-success user-create-art"
					type="submit"
					value="Create article"
				/>
			);
		}
	},
	cloudinaryData: function() {
		return {
			api_key: 487765971445433,
			timestamp: Date.now(),
			signature: 'J5-QYdGfmi8sXKMqhJ3RsQ0ngik',
			callback: 'https://www.eli5ience.com/api/articles'
		};
	},
	render: function(){
    return (
			<div>
				<div className="panel-heading user-pro-panel-heading">
					<h3 className="panel-title">Create An Article!</h3>
					<br></br>
          <form className="form-signin" onSubmit={this.handleSubmit}>
            <label className="sr-only">Title</label>
            <input
							type="text"
							className="form-control"
							placeholder="Title"
							required autofocus
							valueLink={this.linkState('title')}/>
						<br></br>

            <label className="sr-only">Body</label>
						<textarea
							style={{height: 150}}
							className="form-control"
							placeholder="Body"
							required autofocus
							valueLink={this.linkState('body')}/>
            <br/>
						{this.createBtn(this.state.session)}
          </form>
					<a
						className="btn btn-xs btn-danger user-cancel"
						onClick={this.handleCancel}
						role="button">
						Cancel
					</a>
        </div>
			</div>
    );
  }
});


module.exports = ArticleForm;
