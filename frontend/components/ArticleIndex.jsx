var React = require('react');
var ArticleStore = require('../stores/article');
var ApiUtil = require('../utils/api_util');

function _getAllArticles() {
  return ArticleStore.all();
}

var ArticleIndex = React.createClass({

  getInitialState: function () {
    return { articles: ArticleStore.all() };
  },

  componentWillReceiveProps: function () {
  },

  componentDidMount: function () {
    this.articleStoreListener = ArticleStore.addListener(this._onChange);
    ApiUtil.fetchArticles();
  },

  componentWillUnmount: function() {
    this.articleStoreListener.remove();
  },

  _onChange: function () {
    this.setState({ articles: ArticleStore.all() });
  },

  handleClick: function (article) {
    this.props.history.pushState(null, "articles/" + article.id );
  },

  newArticleClick: function() {
    this.props.history.pushState(null, "articles/new");
  },

  commentCount: function(commentsLength) {
    if (commentsLength === 1){
      return "1 Comment";
    } else {
      return commentsLength.toString() + " Comments";
    }
  },

	render: function(){
    var handleClick = this.handleClick;
		return(
			<span>
        <div className="jumbotron">
          <div className="container jumbo">
            <h1 className="jumbo-header" style={{color: '#CCC'}}>Welcome to ELI5ience!</h1>
            <p className="subheader">Annotate science-based articles with "ELI5" (Explain Like I'm 5) breakdowns. </p>
            <a
              className="btn btn-xs btn-success"
              onClick={this.newArticleClick}
              role="button">
              Create article &raquo;
            </a>
          </div>
        </div>

    		<hr></hr>

        <div className="container">
          {this.state.articles.map(function(article) {
            var boundClick = handleClick.bind(null, article);
            return (
              <div key={article.id}
                className="col-md-4">
                <h2 className='index-title'>{article.title}</h2>
                <p className='index-body'>{article.body.slice(0, 300) + "..."}</p>
                  <a className="comment-count"
    								href={"/#/articles/" + article.id}
    							>{this.commentCount(article.comments.length)}</a>
                <p>
                  <a
                    className="btn btn-xs btn-primary btn-view-main"
                    onClick={boundClick}
                    article={article}
                    role="button">
                    View article &raquo;
                  </a>

                </p>
              </div>
            );
          }.bind(this))}
        </div>
      </span>
		);
	}

});

module.exports = ArticleIndex;
