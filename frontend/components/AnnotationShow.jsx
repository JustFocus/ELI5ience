var React = require('react');
var ReactRouter = require('react-router');
var ArticleStore = require('../stores/article');
var SessionStore = require('../stores/session');
var ApiUtil = require('../utils/api_util');
var ImprovementForm = require('./ImprovementForm');
var ImprovementIndex = require('./ImprovementIndex.jsx');

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

	handleDelClick: function (annotationId, articleId) {
		if (confirm("Are you sure you want to delete your annotation?")) {
			ApiUtil.removeAnnotation(annotationId);
			ApiUtil.fetchArticles();
			ApiUtil.fetchSessions();
		}
  },

	findAnnotationById: function(annotationId, annotations) {
		for (var i = 0; i < annotations.length; i++) {
			if (annotationId === annotations[i].id.toString())
				return annotations[i];
		}
		return {
			id: 0,
			improvements: []
		};
	},

	delButton: function(annotationId, articleId){
		var userId;
		for (var i = 0; i < this.props.article.annotations.length; i++) {
			if (this.props.article.annotations[i].id == annotationId) {
				userId = this.props.article.annotations[i].user_id;
			}
		}
		if (this.state.sessions.length > 0) {
			if ( this.state.sessions[0].id === userId ) {
				return (
					<a
						className="btn btn-xs btn-danger"
						onClick={this.handleDelClick.bind(this, annotationId, articleId)}
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
		var annotation = this.findAnnotationById(this.props.annotationId, annotations);
		var delButton = this.delButton(annotation.id, this.props.article.id);
		return (
			<div id="annotation">
				{annotation.body}
				<br></br>
				<br></br>
				By:
				<strong>
					<a
						href={"/#/users/" + annotation.user_id}
					>{" " + annotation.username}</a>
				</strong>
				{" - " + annotation.expertise + " "}
				{delButton}

				<div className="well improv-sec">
					<h5>{annotation.improvements.length || 0} Annotation Improvements</h5>
					<span >
						<ImprovementForm annotationId={annotation.id} />
					</span>
					<br></br>
					<span>
						<ImprovementIndex improvements={annotation.improvements}/>
					</span>
				</div>
			</div>
		);
	}
});


module.exports = AnnotationShow;
