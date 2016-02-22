# Phase 6: Annotations Flux Architecture and Router (2 days)

## Rails
### Models
* Annotation

### Controllers
* Api::AnnotationsController (create, destroy, index, show, update)

### Views
* annotations/index.json.jbuilder
* annotations/show.json.jbuilder

## Flux
### Views (React Components)
* AnnotationItem
* AnnotationForm

### Stores
* Annotation

### Actions
* ApiActions.receiveAllAnnotations -> triggered by ApiUtil
* ApiActions.receiveSingleAnnotation
* ApiActions.deleteAnnotation
* AnnotationActions.fetchAllAnnotations -> triggers ApiUtil
* AnnotationActions.fetchSingleAnnotation
* AnnotationActions.createAnnotation
* AnnotationActions.editAnnotation
* AnnotationActions.destroyAnnotation

### ApiUtil
* ApiUtil.fetchAllAnnotations
* ApiUtil.fetchSingleAnnotation
* ApiUtil.createAnnotation
* ApiUtil.editAnnotation
* ApiUtil.destroyAnnotation

## Gems/Libraries
