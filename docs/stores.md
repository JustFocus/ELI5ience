# Flux Stores

### ArticleStore

Holds all persisted article data.

##### Actions:
- `receiveAllArticles`
- `receiveSingleArticle`
- `removeArticle`
- `receiveArticleFormParams`
- `receiveCommentFormParams`
- `receiveAllAnnotations`
- `receiveSingleAnnotation`
- `removeAnnotation`
- `receiveAnnotationFormParams`
- `receiveImprovementFormParams`

##### Listeners:
- `ArticlesIndex` (passes to `ArticleIndexItem` via props)
- `ArticleDetail`
- `ArticleForm`
- `CommentForm`
- `AnnotationIndex`
- `AnnotationForm`
- `ImprovementForm`

### SearchStore

Holds search parameters to send to the API.

##### Actions:
- `receiveSearchParams`

##### Listeners:
- `SearchIndex`

### SearchSuggestionStore

Holds typeahead suggestions for search.

##### Actions:
- `receiveSearchSuggestions`

##### Listeners:
- `SearchSuggestions`
