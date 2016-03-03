var React = require('react');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');
var SessionStore = require('../stores/session');

var ImprovementIndex = React.createClass({

	getInitialState: function() {
		return{
			improvements: this.props.improvements || [],
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

	handleClick: function (improvement) {
		if (confirm("Are you sure you want to delete your comment?")) {
			ApiUtil.removeImprovement(improvement.id);
			ApiUtil.fetchArticles();
			ApiUtil.fetchSessions();
  	}
  },

	componentWillReceiveProps: function() {
		this.setState({
			improvements: this.props.improvements || [],
			sessions: SessionStore.all()
		});
	},

	render: function() {
		var handleClick = this.handleClick;
		var delButton;
		return (
			<div>
				<ul className="comment-list">
					{this.state.improvements.map(function(improvement){
						var boundClick = handleClick.bind(null, improvement);
						if (this.state.sessions.length > 0) {
							if ( this.state.sessions[0].id === improvement.user_id ) {
								delButton =
									<a
										className="btn btn-xs btn-danger"
										onClick={boundClick}
										improvement={improvement}
										role="button">
										Delete
									</a>;
							} else {
								delButton = <span></span>;
							}
						}
						return (
							<li className="list-group-item" key={improvement.id}>
								<div className="comment-user">
								<strong>{improvement.username + " - "}</strong>
								{improvement.expertise + " "}
								{delButton}
								</div>
								<br></br>
								{improvement.body}
								<br></br>
								<br></br>

								<div className="comment-date"> {
									new Date(improvement.created_at).toDateString()
									+ " " +
									new Date(improvement.created_at).toLocaleTimeString()
									}
								</div>
							</li>
						);
						}.bind(this))
					}
				</ul>
			</div>
		);
	}
});


module.exports = ImprovementIndex;
