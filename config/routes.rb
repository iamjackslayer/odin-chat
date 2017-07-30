Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  # users controller
  root 'users#index'
  get '/users/lobby' => 'users#lobby'
  get '/users/index' => 'users#index'
  post '/users' => 'users#create'

  # messages controller
  post '/messages' => 'messages#create'
  get '/messages/all_messages_in_particular_group' => 'messages#all_messages_in_particular_group'


  # sessions controller
  post '/signin' => 'sessions#create'
  post '/signout' => 'sessions#destroy'


  # ActionCable
  mount ActionCable.server, at: '/cable'
end