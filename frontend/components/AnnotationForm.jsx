var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ArticleStore = require('../stores/article');
var SessionStore = require('../stores/session');

var AnnotationForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			annotation: null,
			session: SessionStore.all()
    };
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

	handleSubmit: function(event){
		event.preventDefault();
		var annotation = {
			body: this.state.body,
			article_id: this.props.articleId,
			selection_start: this.props.selectionStart,
			selection_length: this.props.selectionLength,
		};
		ApiUtil.createAnnotation(annotation);
		ApiUtil.fetchArticles();
		this.props.submitCallback();
	},

	postBtn: function(session) {
		if (session.length === 0) {
			return <div className='errPost'><a href='./session/new'>Login to create an annotation!</a></div>;
		} else {
			return (
				<input
					className="btn btn-xs btn-success user-create-art"
					type="submit"
					value="Create annotation"
				/>
			);
		}
	},

	render: function(){
    return (
			<div>
				<div>
					<strong>Creating annotation for:</strong>
					<br></br>
					<br></br>
					<em>{'"' + this.props.selectedText + '"'}</em>
					<br></br>
					<br></br>
					<br></br>
				</div>
        <form onSubmit={this.handleSubmit}>
          <label className="sr-only">Body</label>
					<textarea
						className="form-control comment-form"
						placeholder="Add annotation..."
						required autofocus
						valueLink={this.linkState('body')}/>
          <br/>
					{this.postBtn(this.state.session)}
        </form>
			</div>
    );
  }
});


module.exports = AnnotationForm;
