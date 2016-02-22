# Flux Stores

### ArticleStore

Holds all persisted article data.

##### Actions:
- `receiveAllArticles`
- `receiveSingleArticle`
- `removeArticle`

##### Listeners:
- `ArticlesIndex` (passes to `ArticleIndexItem` via props)
- `ArticleDetail`

### ArticleFormStore

Holds un-persisted article data to send to the API.

##### Actions:
- `receiveArticleFormParams`

##### Listeners:
- `ArticleForm`

### CommentFormStore

Holds un-persisted comment data to send to the API.

##### Actions:
- `receiveCommentFormParams`

##### Listeners:
- `CommentForm`

### AnnotationStore

Holds all persisted annotation data.

##### Actions:
- `receiveAllAnnotations`
- `receiveSingleAnnotation`
- `removeAnnotation`

##### Listeners:
- `AnnotationIndex`

### AnnotationFormStore

Holds un-persisted annotation data to send to the API.

##### Actions:
- `receiveAnnotationFormParams`

##### Listeners:
- `AnnotationForm`

### ImprovementFormStore

Holds un-persisted improvement data to send to the API.

##### Actions:
- `receiveImprovementFormParams`

##### Listeners:
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
