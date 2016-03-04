var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var SessionStore = require('../stores/session');

var ImprovementForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      body: "",
			annotationId: this.props.annotationId,
			user_id: "",
			session: SessionStore.all()
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
	componentDidMount: function () {
		this.sessionStoreListener = SessionStore.addListener(this._onChange);
		ApiUtil.fetchSessions();
	},
	componentWillUnmount: function() {
		this.sessionStoreListener.remove();
	},
	_onChange: function () {
		this.setState({ session: SessionStore.all()});
  },

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			body: "",
			annotationId: this.props.annotationId,
			user_id: ""
		});
	},
	postBtn: function(session) {
		if (session.length === 0) {
			return <div className='errPost'>Login to suggest an improvement!</div>;
		} else {
			return (
				<input
					className="btn btn-xs btn-success comment-post-btn"
					type="submit"
					value="Post"/>

			);
		}
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
						{this.postBtn(this.state.session)}
          </form>
        </div>
    );
  }
});


module.exports = ImprovementForm;
