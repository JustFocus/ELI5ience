var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var ImprovementForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			annotationId: this.props.annotationId,
			user_id: ""
    };
  },

	handleSubmit: function(event){
		event.preventDefault();
		var improvement = {
			body: this.state.body,
			annotation_id: this.state.annotationId
		};
		ApiUtil.createImprovement(improvement);
		ApiUtil.fetchArticles();
	},

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			body: "",
			annotationId: this.props.annotationId,
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
							required autofocus
							placeholder="Add an improvement..."
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


module.exports = ImprovementForm;
