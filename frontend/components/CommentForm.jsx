var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var CommentForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			articleId: this.props.articleId,
			user_id: ""
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

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			body: "",
			articleId: this.props.articleId,
			user_id: ""
		});
	},

	render: function(){
    return (
        <div id='annotation'>
          <form onSubmit={this.handleSubmit}>
            <br/>
            <input
							type="text"
							placeholder="Add a comment..."
							className="form-control comment-form"
							valueLink={this.linkState('body')}
						/>
            <br/>
						<input className="btn btn-xs btn-success comment-post-btn" type="submit" value="Post"/>
          </form>
        </div>
    );
  }
});


module.exports = CommentForm;
