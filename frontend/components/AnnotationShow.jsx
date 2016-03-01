var React = require('react');
var ReactRouter = require('react-router');
var ArticleStore = require('../stores/article');
var SessionStore = require('../stores/session');
var ApiUtil = require('../utils/api_util');

var AnnotationShow = React.createClass({

	getInitialState: function () {
    return {
			user: ArticleStore.authors(),
			articles: ArticleStore.all(),
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

	handleDelClick: function (annotationId) {
		if (confirm("Are you sure you want to delete your annotation?")) {
			ApiUtil.removeAnnotation(annotationId);
			ApiUtil.fetchArticles();
			ApiUtil.fetchSessions();
		}
  },

	annotationBody: function(annotationId, annotations) {
		for (var i = 0; i < annotations.length; i++) {
			if (annotationId === annotations[i].id.toString())
				return {
					body: annotations[i].body,
					user_id: annotations[i].user_id
				};
		}
		return ['', 0];
	},

	delButton: function(userId, annotationId){
		if (this.state.sessions.length > 0) {
			if ( this.state.sessions[0].id === userId ) {
				return (
					<a
						className="btn btn-xs btn-danger"
						onClick={this.handleDelClick.bind(null, annotationId)}
						role="button">
						Delete
					</a>);
			} else
			return '';
		}
	},


	render: function() {
		var handleDelClick = this.handleDelClick;
		var user = this.state.user;
		var annotations = this.props.article.annotations;

		var annotationId = this.props.annotationId;

		var annotationDetails = this.annotationBody(annotationId, annotations);

		var delButton = this.delButton(annotationDetails.user_id, annotationId);
		return (
			<div id="annotation">
				{annotationDetails.body}
				<br></br>
				{delButton}
			</div>
		);
	}
});


module.exports = AnnotationShow;
