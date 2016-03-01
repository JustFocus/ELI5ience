var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ArticleStore = require('../stores/article');

var AnnotationForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			annotation: null
    };
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
	
	render: function(){
    return (
			<div>
        <form onSubmit={this.handleSubmit}>
          <label className="sr-only">Body</label>
					<textarea
						className="form-control comment-form"
						placeholder="Add annotation..."
						required autofocus
						valueLink={this.linkState('body')}/>
          <br/>
					<input
						className="btn btn-xs btn-success user-create-art"
						type="submit"
						value="Create annotation"
					/>
        </form>
			</div>
    );
  }
});


module.exports = AnnotationForm;
