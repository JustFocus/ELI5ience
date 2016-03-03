var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var ApiUtil = require('../utils/api_util');
var ArticleForm = require('./ArticleForm');
var ArticleStore = require('../stores/article');
var CommentForm = require('./CommentForm');
var CommentIndex = require('./CommentIndex.jsx');
var AnnotationForm = require('./AnnotationForm');
var AnnotationShow = require('./AnnotationShow');

var ArticleShow = React.createClass({

	getInitialState: function() {
		var articleId = this.props.params.articleId;
		var article = this._findArticleById(articleId) || {comments:  []};
		return {
			article: article,
			annotationDisplay: 0,
			selection_start: 0,
			selection_length: 0
			};
	},

	componentDidMount: function () {
		// TODO: only fetch articles if we don't have user info in _findArticleById
		this.articleListener = ArticleStore.addListener(this._onChange);
		ApiUtil.fetchArticles();
	},

	componentWillUnmount: function() {
		this.articleListener.remove();
	},

	componentWillReceiveProps: function (propUpdate) {
		this.setState({
			articleId: propUpdate.params.articleId,
			article: this._findArticleById(propUpdate.params.articleId)
		});
	},

	_onChange: function () {
		this.setState({
			article: this._findArticleById(this.props.params.articleId) || {}
		});
	},

	_findArticleById: function(id) {
		var foundArticle;
		ArticleStore.all().forEach(function (article) {
			if (id == article.id) {
				foundArticle = article;
			}
		}.bind(this));

		return foundArticle;

	},

	// _linkifyBody: function(body) {
	// 	var linkedBody = body;
	// 	this.state.article.annotations.forEach(function(annotation){
	// 		linkedBody = linkedBody.slice(
	// 			0,
	// 			annotation.selection_start
	// 		) + <a href='#'> +
	// 		linkedBody.slice(annotation.selection_start);
	// 		linkedBody = linkedBody.slice(
	// 			0,
	// 			annotation.selection_start + annotation.selection_length
	// 		) + </a> +
	// 		linkedBody.slice(annotation.selection_start + annotation.selection_length);
	// 	});
	// 	return linkedBody;
	// },

	splitBodySections: function(sortedAnnotations) {
		var sections = [];
		if (this.hasOwnProperty('state')){
			if (this.state.article.hasOwnProperty('annotations')) {
				for (var i = 1; i < sortedAnnotations.length; i++) {
					sections.push(this.state.article.body.slice(
						sortedAnnotations[i - 1].selection_start +
						sortedAnnotations[i - 1].selection_length,
						sortedAnnotations[i].selection_start));
				}
			}
		}
		return sections;
	},

	splitLinkSecitons: function(sortedAnnotations) {
		var sections = [];
		if (this.hasOwnProperty('state')){
			if (this.state.article.hasOwnProperty('annotations')) {
				for (var i = 0; i < sortedAnnotations.length; i++) {
					sections.push(this.state.article.body.slice(
						sortedAnnotations[i].selection_start,
						sortedAnnotations[i].selection_start +
						sortedAnnotations[i].selection_length));
				}
			}
		}
		return sections;
	},

	splitBodyFL: function(sortedAnnotations) {
		var sections = [];
		if (this.hasOwnProperty('state')){
			if (this.state.article.hasOwnProperty('annotations')) {
				if (sortedAnnotations.length === 0)
				{return [this.state.article.body, ''];}
				sections.push(
					this.state.article.body.slice(
						0,
						sortedAnnotations[0].selection_start
					)
				);
				sections.push(
					this.state.article.body.slice(
						sortedAnnotations[sortedAnnotations.length - 1].selection_start + sortedAnnotations[sortedAnnotations.length - 1].selection_length,
						this.state.article.body.length
					)
				);
			}
		}
		return sections;
	},

	bodyContains: function(text, startIdx) {
		if (startIdx >= 0) {
			return true;
		} else {
			return false;
		}
	},

	uniqueText: function(text, startIdx) {
		if (startIdx ===
			this.state.article.body.lastIndexOf(text)){
				return true;
			} else {
				return false;
			}
	},

	uniqueSelection: function(text, startIdx) {
		var endIdx = startIdx + text.length;
		var annStartIdx;
		var annEndIdx;
		for (var i = 0; i < this.state.article.annotations.length; i++) {
			annStartIdx = this.state.article.annotations[i].selection_start;
			annEndIdx = annStartIdx + this.state.article.annotations[i].selection_length;
			if ( (startIdx >= annStartIdx && startIdx <= annEndIdx) ||
					(endIdx >= annStartIdx && endIdx <= annEndIdx) ){
						return false;
				}
		}
		return true;
	},

	sortAnnotations: function(array) {
		var key = 'selection_start';
		if (this.state.article.hasOwnProperty('annotations')) {
	    return array.sort(function(a, b) {
	        var x = a[key]; var y = b[key];
	        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	    });
		}
	},

	handleMouseUp: function(e) {
		// console.log(window.getSelection().toString());
		// ReactDOM.unmountComponentAtNode(document.getElementById('annotation'));
		// this.props.children = null;
		// this.setState({mounted: false});
		var textSelection = window.getSelection().toString();
		var textIdx = this.state.article.body.indexOf(textSelection);
		if ( this.bodyContains(textSelection, textIdx) &&
		this.uniqueText(textSelection, textIdx) &&
		this.uniqueSelection(textSelection, textIdx) ) {
			this.setState({
				annotationDisplay: 2,
				selection_start: textIdx,
				selection_length: textSelection.length
			});
			return true;
		} else {
			this.setState({
				annotationDisplay: 0,
				selection_start: 0,
				selection_length: 0
			});
			return false;
		}
	},

	linkClickHandler: function(){
		this.setState({annotationDisplay: 1});
	},

	resetFormView: function() {
		this.setState({
			annotationDisplay: 0,
			selection_start: 0,
			selection_length: 0
		});
	},

	commentLength: function () {
		if (this.state.article.hasOwnProperty('comments')) {
			return this.state.article.comments.length;
		} else {
			return 0;
		}
	},

	render: function() {
		// var article = this.props.article;
		var sortedAnnotations = this.sortAnnotations(this.state.article.annotations);
		var handleClick = this.handleClick;
		var bodyFristLast = this.splitBodyFL(sortedAnnotations);
		var bodySections = this.splitBodySections(sortedAnnotations);
		var linkSections = this.splitLinkSecitons(sortedAnnotations);
		var Link = ReactRouter.Link;
		var validText = false;
		return (
			<div>
				<br></br>
				<br></br>
				<div className="well art-details">
					<h1>
						{this.state.article.title}
					</h1>
					{this.state.article.image_link}
					<br></br>
					{this.state.article.background_link}
					<br></br>
					<span>
						{this.state.article.locked}
						<br></br>
						<strong>Submitted by: </strong>
						{this.state.article.username}
						<br></br>
						<strong>Expertise: </strong>
						{this.state.article.expertise}
					</span>
				</div>
				<div className="body-ann-cont">
					<div className="well art-body">
						{
							function(){
								if (this.hasOwnProperty('state')){
									if (this.state.article.hasOwnProperty('annotations')) {
										return( <div onMouseUp={this.handleMouseUp}>
											{bodyFristLast.shift()}
											{this.state.article.annotations.map(function(annotation){
												return(
														<div key={annotation.id} className="art-sec">
															<a
																href={"/#/articles/" + this.state.article.id +"/annotations/" + annotation.id}
																onClick={this.linkClickHandler}
																className={"ann-link" + annotation.id}>
																{linkSections.shift()}
															</a>
															{bodySections.shift()}
														</div>
												);
											}.bind(this))}
											{bodyFristLast.shift()}

										</div>);
									}
								}
							}.bind(this)()
						}
					</div>
					<div className="well art-annotation" articles={this.props.articles}>
						{ function () {
							if (this.state.annotationDisplay === 1){
								return <AnnotationShow
									article={this.state.article}
									annotationId={this.props.params.annotationId}
									/>;
							} else if (this.state.annotationDisplay === 2){
								return (
									<AnnotationForm
									articleId={this.props.params.articleId}
									selectionStart={this.state.selection_start}
									selectionLength={this.state.selection_length}
									submitCallback={this.resetFormView}
									/>
								);
							} else {
								return (<div>
									<strong>{"<-----"} <br></br>
									Select Text to create an annotation, or click a link to display an annotation
									<br></br>
									{"<-----"}</strong>
								</div>);
							}
						}.bind(this)() }
					</div>
					<div className="well comment-sec">
						<h5>{this.commentLength()} Article Comments</h5>
						<span>
							<CommentForm  articleId={this.props.params.articleId} />
						</span>
						<br></br>
						<span>
							<CommentIndex comments={this.state.article.comments}/>
						</span>
					</div>
				</div >

			</div>
		);
	}
});


module.exports = ArticleShow;
