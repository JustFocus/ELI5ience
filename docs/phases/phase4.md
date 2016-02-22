# Phase 4: Comments (0.5 day)

## Rails
### Models
* Comment

### Controllers
* Api::CommentsController (create, destroy, index, show, update)

### Views
* comments/index.json.jbuilder
* comments/show.json.jbuilder

## Flux
### Views (React Components)
* CommentsIndex
  - CommentsIndexItem
* CommentForm

### Stores
* Comment

### Actions
* ApiActions.receiveAllComments -> triggered by ApiUtil
* ApiActions.receiveSingleComment
* ApiActions.deleteComment
* CommentActions.fetchAllComments -> triggers ApiUtil
* CommentActions.fetchSingleComment
* CommentActions.createComment
* CommentActions.editComment
* CommentActions.destroyComment

### ApiUtil
* ApiUtil.fetchAllComments
* ApiUtil.fetchSingleComment
* ApiUtil.createComment
* ApiUtil.editComment
* ApiUtil.destroyComment

## Gems/Libraries
