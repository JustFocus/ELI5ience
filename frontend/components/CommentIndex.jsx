var React = require('react');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');

var CommentIndex = React.createClass({

	getInitialState: function() {
		return{comments: this.props.comments};
	},

	handleClick: function (comment) {
		if (confirm("Are you sure you want to delete your comment?")) {
			ApiUtil.removeComment(comment.id);
			ApiUtil.fetchArticles();
  	}
  },

	componentWillReceiveProps: function() {
		this.setState({
			comments: this.props.comments
		});
	},

	render: function() {
		var handleClick = this.handleClick;
		return (
			<div>
				<ul> Comments
					{this.props.comments.map(function(comment){
						var boundClick = handleClick.bind(null, comment);
						return (
							<li key={comment.id}>
								{comment.username}<br></br>
								{comment.expertise}<br></br>
								{comment.created_at}<br></br>
								{comment.body}<br></br>
								<a
									className="btn btn-xs btn-danger"
									onClick={boundClick}
									comment={comment}
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


module.exports = CommentIndex;
