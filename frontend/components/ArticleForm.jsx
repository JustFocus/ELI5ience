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
          <h3>Create An Article!</h3>
          <form onSubmit={this.handleSubmit}>
            <label>Title</label>
            <input type="text" valueLink={this.linkState('title')}/>
            <br/>
            <label>Body</label>
            <input type="text" valueLink={this.linkState('body')}/>
            <br/>
						<label>Image Url</label>
            <input type="text" valueLink={this.linkState('imageLink')}/>
            <br/>
						<label>Background Url</label>
            <input type="text" valueLink={this.linkState('backgroundLink')}/>
            <br/>
						<input type="submit" value="Create article"/>
          </form>
          <button onClick={this.handleCancel}>Cancel</button>
        </div>
    );
  }
});


module.exports = ArticleForm;
