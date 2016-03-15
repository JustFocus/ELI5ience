var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var SessionStore = require('../stores/session');

var CommentForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			articleId: this.props.articleId,
			user_id: "",
			session: SessionStore.all()
    };
  },

	handleSubmit: function(event){
		event.preventDefault();
		var comment = {
			body: this.state.body,
			article_id: this.state.articleId
		};
		ApiUtil.createComment(comment);
		ApiUtil.fetchArticles();
	},

	componentDidMount: function() {
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchSessions();
	},

	_onChange: function () {
		this.setState({ session: SessionStore.all()});
	},

	componentWillUnmount: function() {
		this.sessionStoreListener.remove();
	},

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			body: "",
			articleId: this.props.articleId,
			user_id: ""
		});
	},

	postBtn: function(session) {
		if (session.length === 0) {
			return <div className='errPost'><a href='./session/new'>Login to post a comment!</a></div>;
		} else {
			return (
				<input className="btn btn-xs btn-success comment-post-btn"
					type="submit"
					value="Post"/>
			);
		}
	},

	render: function(){
    return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <br/>
            <input
							type="text"
							required autofocus
							placeholder="Add a comment..."
							className="form-control comment-form"
							valueLink={this.linkState('body')}
						/>
            <br/>
						{this.postBtn(this.state.session)}
          </form>
        </div>
    );
  }
});


module.exports = CommentForm;
