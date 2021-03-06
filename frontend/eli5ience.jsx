var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var BrowserHistory = ReactRouter.BrowserHistory;

var ArticleShow = require('./components/ArticleShow');
var ArticleForm = require('./components/ArticleForm');
var ArticleIndex = require('./components/ArticleIndex');
var UserShow = require('./components/UserShow');
var AnnotationShow = require('./components/AnnotationShow');
var AnnotationForm = require('./components/AnnotationForm');

var App = React.createClass({
  render: function(){
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});


var routes = (
  <Route path="/" component={App}>
    <IndexRoute component={ArticleIndex}/>
    <Route path="articles/new" component={ArticleForm}/>
    <Route path="users/:userId" component={UserShow}/>
    <Route path="articles/:articleId" component={ArticleShow}>
      <Route path="annotations/:annotationId" component={AnnotationShow}>
      </Route>
      <Route path="annotations/new" component={AnnotationForm}/>
    </Route>
  </Route>
);

window.loadApp = function () {
  var root = document.getElementById('content');

  ReactDOM.render(<Router>{routes}</Router>, root);
};
