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
        <div>
          <form onSubmit={this.handleSubmit}>
            <br/>
            <input
							type="text"
							placeholder="Add a comment..."
							valueLink={this.linkState('body')}
						/>
            <br/>
						<input type="submit" value="Post"/>
          </form>
        </div>
    );
  }
});


module.exports = CommentForm;
