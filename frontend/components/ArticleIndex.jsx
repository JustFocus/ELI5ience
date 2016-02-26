var React = require('react');
var ArticleStore = require('../stores/article');
var ApiUtil = require('../utils/api_util');

// TODO: Search
// var FilterParamsStore = require('../stores/filter_params');
// var Filters = require('./Filters');


function _getAllArticles() {
  return ArticleStore.all();
}

// TODO: Search
// function _getFilterParams() {
//   return FilterParamsStore.params();
// }

var ArticleIndex = React.createClass({

  getInitialState: function () {
    return { articles: ArticleStore.all() };
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

	render: function(){
    var handleClick = this.handleClick;
		return(
			<span>
        <div className="jumbotron">
          <div className="container">
            <h1>Welcome to ELI5ience!</h1>
            <p>ELI5ience is a web application where users can post and annotate articles. </p>
            <a
              className="btn btn-xs btn-primary"
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
              <div key={article.id} style={{backgroundColor: '#FFFFFF'}}
                className="col-md-4">
                <h2>{article.title}</h2>
                <p>{article.body.slice(0, 300) + "..."}</p>
                <p>
                  <a
                    className="btn btn-xs btn-primary"
                    onClick={boundClick}
                    article={article}
                    role="button">
                    View article &raquo;
                  </a>
                </p>
              </div>
            );
          })}
        </div>
      </span>
		);
	}

});

module.exports = ArticleIndex;
