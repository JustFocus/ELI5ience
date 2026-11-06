Rails.application.routes.draw do
  resource :session, only: %i[ new create destroy ]
  resource :guest_session, only: :create
  resources :users, only: %i[ new create ]

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      get "me", to: "me#show"
      resources :users, only: :show
      resources :articles, only: %i[ index show create destroy ] do
        resources :annotations, only: :create
        resources :comments, only: :create
      end
      resources :annotations, only: :destroy do
        resources :improvements, only: :create
      end
      resources :improvements, only: :destroy
      resources :comments, only: :destroy
      # Unknown /api/v1 paths get the JSON error shape, not the HTML 404 page.
      match "*unmatched", to: "base#route_not_found", via: :all
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "home#show"
end
