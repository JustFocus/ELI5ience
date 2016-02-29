var React = require('react');
var ApiUtil = require('../utils/api_util');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ArticleStore = require('../stores/article');

var ArticleForm = React.createClass({
	mixins: [LinkedStateMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
	getInitialState: function(){
    return {
      title: "",
      body: "",
			imageLink: "",
			backgroundLink: "",
			article: null
    };
  },

	handleSubmit: function(event){
		event.preventDefault();
		var article = {
			title: this.state.title,
			body: this.state.body,
			image_link: this.state.imageLink,
			background_link: this.state.backgroundLink,
		};
		ApiUtil.createArticle(article);
	},
	componentDidMount: function () {
		this.articleStoreListener = ArticleStore.addListener(this._onChange);
	},
	componentWillUnmount: function() {
		this.articleStoreListener.remove();
	},
	_onChange: function () {
    this.setState({ article: ArticleStore.mostRecent() });
		this.navigateToArticle();
  },
	navigateToArticle: function(){
		debugger;
		this.props.history.pushState(
			null,
			"articles/" + this.state.article.id
		);
	},
	navigateToHome: function(){
		this.props.history.pushState(null, "/");
	},
	handleCancel: function(event){
		event.preventDefault();
		this.navigateToHome();
	},
	render: function(){
    return (
			<div>
				<br></br>
				<div className="panel-heading user-pro-panel-heading">
					<h3 className="panel-title">Create An Article!</h3>
					<br></br>
          <form className="form-signin" onSubmit={this.handleSubmit}>
            <label className="sr-only">Title</label>
            <input
							type="text"
							className="form-control"
							placeholder="Title"
							required autofocus
							valueLink={this.linkState('title')}/>
						<br></br>

            <label className="sr-only">Body</label>
						<textarea
							className="form-control"
							placeholder="Body"
							required autofocus
							valueLink={this.linkState('body')}/>
            <br/>
						<label className="sr-only">Image Url</label>
							<input
								type="text"
								className="form-control"
								placeholder="Image URL"
								valueLink={this.linkState('imageLink')}/>
						<label className="sr-only">Background Url</label>
							<input
								type="text"
								className="form-control"
								placeholder="Background URL"
								valueLink={this.linkState('backgroundLink')}/>
            <br/>
						<input className="btn btn-xs btn-success user-create-art" type="submit" value="Create article"/>
          </form>
					<a
						className="btn btn-xs btn-danger user-cancel"
						onClick={this.handleCancel}
						role="button">
						Cancel
					</a>
        </div>
			</div>
    );
  }
});


module.exports = ArticleForm;
