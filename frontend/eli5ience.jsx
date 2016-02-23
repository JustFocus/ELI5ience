var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');

//TODO: Search
// var Search = require('./components/Search');

//TODO: Routing
// var Router = ReactRouter.Router;
// var Route = ReactRouter.Route;
// var IndexRoute = ReactRouter.IndexRoute;


// var root = document.getElementById('content');


// var App = React.createClass({
//   render: function(){
//     return (
//       <div>
//         <header><h1>ELI5Science</h1></header>
//       </div>
//     );
//   }
// });
//
//
// ReactDOM.render(<App />, root);

ReactDOM.render(
      <div>
        <header><h1>ELI5Science</h1></header>
      </div>,
      document.getElementById('content')
);

// TODO: Router
// {this.props.children}

// TODO: Routes and Router
// var routes = (
//   <Route path="/" component={App}>
//     <IndexRoute component={Search}/>
//     <Route path="benches/new" component={BenchForm}/>
//     <Route path="benches/:benchId" component={BenchShow}>
//       <Route path="review" components={ReviewForm}/>
//     </Route>
//   </Route>
// );
// ReactDOM.render(<Router>{routes}</Router>, root);
