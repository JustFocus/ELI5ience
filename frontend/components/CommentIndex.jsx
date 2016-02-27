var React = require('react');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');
var SessionStore = require('../stores/session');

var CommentIndex = React.createClass({

	getInitialState: function() {
		return{
			comments: this.props.comments,
			sessions: SessionStore.all()
		};
	},

	componentWillUnmount: function() {
		this.sessionStoreListener.remove();
	},

	componentDidMount: function () {
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchSessions();
	},

	_onChange: function () {
		this.setState({
			sessions: SessionStore.all()
		 });
	},

	handleClick: function (comment) {
		if (confirm("Are you sure you want to delete your comment?")) {
			ApiUtil.removeComment(comment.id);
			ApiUtil.fetchArticles();
			ApiUtil.fetchSessions();
  	}
  },

	componentWillReceiveProps: function() {
		this.setState({
			comments: this.props.comments,
			sessions: SessionStore.all()
		});
	},

	render: function() {
		var handleClick = this.handleClick;
		var delButton;
		return (
			<div>
				<ul> Comments
					{this.props.comments.map(function(comment){
						var boundClick = handleClick.bind(null, comment);
						if (this.state.sessions.length > 0) {
							if ( this.state.sessions[0].id === comment.user_id ) {
								delButton = <a
															className="btn btn-xs btn-danger"
															onClick={boundClick}
															comment={comment}
															role="button">
															Delete
														</a>;
							}
						}
						return (
							<li key={comment.id}>
								{comment.username}<br></br>
								{comment.expertise}<br></br>
								{comment.created_at}<br></br>
								{comment.body}<br></br>
							{delButton}
							</li>
						);
					}.bind(this))}
				</ul>
			</div>
		);
	}
});


module.exports = CommentIndex;
