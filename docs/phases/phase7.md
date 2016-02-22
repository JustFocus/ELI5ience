# Phase 7: Improvements (1 day)

## Rails
### Models
* Improvement

### Controllers
* Api::ImprovementsController (create, destroy, index, show, update)

### Views
* improvements/index.json.jbuilder
* improvements/show.json.jbuilder

## Flux
### Views (React Components)
* ImprovementsIndex
* ImprovementForm

### Stores
* Improvement

### Actions
* ApiActions.receiveAllImprovements -> triggered by ApiUtil
* ApiActions.receiveSingleImprovement
* ApiActions.deleteImprovement
* ImprovementActions.fetchAllImprovements -> triggers ApiUtil
* ImprovementActions.fetchSingleImprovement
* ImprovementActions.createImprovement
* ImprovementActions.editImprovement
* ImprovementActions.destroyImprovement

### ApiUtil
* ApiUtil.fetchAllImprovements
* ApiUtil.fetchSingleImprovement
* ApiUtil.createImprovement
* ApiUtil.editImprovement
* ApiUtil.destroyImprovement

## Gems/Libraries
