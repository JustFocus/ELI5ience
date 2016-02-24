Rails.application.routes.draw do
  resources :users, only: [:create, :new, :show]
  resource :session, only: [:create, :new, :destroy]

  namespace :api, defaults: {format: :json} do
    # resources :users, only: [:create, :update, :new]
    # resources :session, only: [:create, :destroy, :new]

    # TODO: articles routes
    # resources :articles, only: [:index, :create]

  end

  root "static_pages#root"

end
