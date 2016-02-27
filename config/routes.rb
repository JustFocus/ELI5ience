Rails.application.routes.draw do
  resources :users, only: [:create, :new]
  resource :session, only: [:create, :new, :destroy]

  namespace :api, defaults: {format: :json} do
    # resources :users, only: [:create, :update, :new]
    # resources :session, only: [:create, :destroy, :new]
    resources :session, only: [:index]
    resources :users, only: [:show]
    resources :articles
    resources :comments, only: [:create, :destroy]

  end

  root "static_pages#root"

end
