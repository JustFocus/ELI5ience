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

	},

	componentDidMount: function () {

	},

	_onChange: function () {

	},

	handleDelClick: function (article) {

  },

	handleArticleClick: function(article) {
	},

	newArticleClick: function() {
	},

	annotationBody: function(annotationId, annotations) {
		for (var i = 0; i < annotations.length; i++) {
			if (annotationId === annotations[i].id.toString()) return annotations[i].body;
		}
	},

	render: function() {
		var handleDelClick = this.handleDelClick;
		var handleArticleClick = this.handleArticleClick;
		var user = this.state.user;
		var annotations = this.props.article.annotations

		var annotationId = this.props.annotationId
		var delButton;

		return (
			<div id="annotation">
				{this.annotationBody(annotationId, annotations)}
			</div>
		);
	}
});


module.exports = AnnotationShow;
