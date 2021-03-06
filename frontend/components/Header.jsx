var React = require('react');
var ReactRouter = require('react-router');

var Header = React.createClass({
	render: function() {
		return (
			<div>
				<nav class="navbar navbar-inverse navbar-fixed-top">
					<div class="container">
						<div class="navbar-header">
							<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
								<span class="sr-only">Toggle navigation</span>
								<span class="icon-bar"></span>
								<span class="icon-bar"></span>
								<span class="icon-bar"></span>
							</button>
							<a class="navbar-brand" href="<%= root_url %>">ELI5cience</a> 
						</div>
						<div id="navbar" class="navbar-collapse collapse">
							<form class="navbar-form navbar-right">
								<% if signed_in? %>
									<%= link_to "Welcome, " + current_user.username, user_url(@user.id) %><br>
									<%= link_to( "Sign Out", session_url, method: :delete, class: 'btn btn-xs btn-default' )%> <br>
								<% else %>
									<%= link_to "Log In / Guest", new_session_url %> <br>
									<%= link_to "Create Account", new_user_url %>
								<% end %>
							</form>
						</div>
					</div>
				</nav>
				<br>
				<br>

			</div>
		);
	}
});


module.exports = Header;
