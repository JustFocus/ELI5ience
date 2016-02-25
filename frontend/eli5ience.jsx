var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var ArticleShow = require('./components/ArticleShow');
var ArticleForm = require('./components/ArticleForm');
var ArticleIndex = require('./components/ArticleIndex');

//TODO: Search
// var Search = require('./components/Search');

//TODO: Routing

var root = document.getElementById('content');

var App = React.createClass({
  render: function(){
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<App />, root);

// ReactDOM.render(
//       <div style={{color: "white"}}>
//         <header><h1>ELI5Science React Main Page</h1></header>
//       </div>,
//       document.getElementById('content')
// );

// TODO: Routing Router
// {this.props.children}

// TODO: Routing Routes and Router
var routes = (
  <Route path="/" component={App}>
    <IndexRoute component={ArticleIndex}/>
    <Route path="articles/new" component={ArticleForm}/>
    <Route path="articles/:articleId" component={ArticleShow}>
    </Route>
  </Route>
);
ReactDOM.render(<Router>{routes}</Router>, root);

// TODO: Routing Future Routes
// <Route path="annotation" component={AnnotationShow}>
//  // <Route path="improvements" component={ImprovementsIndex} />
//  </Route>
//  <Route path="annotation/new" component={AnnotationNew}>
// </Route>

// TODO: Routing Remove old routes
// <IndexRoute component={Search}/>
// <Route path="benches/new" component={BenchForm}/>
// <Route path="benches/:benchId" component={BenchShow}>
//   <Route path="review" components={ReviewForm}/>
// </Route>
