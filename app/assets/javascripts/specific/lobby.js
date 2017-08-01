_.templateSettings = {
  interpolate: /\{\{\=(.+?)\}\}/g,
  evaluate: /\{\{(.+?)\}\}/g
};
// ---------------VIEW---------------
// cardUser
var CardUser;
var cardUser;
// chat window
var ChatWindow;
var chatWindow;
// search people bar
var SearchPeopleBar;
var searchPeopleBar;

// ---------------MODEL---------------
var user;
var currentUser;
var User;


// --------------COLLECTION-----------
var users;
var Users;





$(document).ready(function(){

// ---------------VIEW---------------
	CardUser = Backbone.View.extend({
		el:'#people',
		template: _.template($('#card-user-template').html()),
		initialize: function(){
			this.render();
		},
		render: function(){
			console.log(users);
			this.$el.append(this.template({users: users.models}))
		}
	});

	ChatWindow = Backbone.View.extend({
		el:'#chat-window',
		events:{
			'keypress #userInput':'send'
		},
		template: _.template($('#chat-window-template').html()),
		render: function(){
			var tem = {partner: currentUser.partner,current_user: currentUser};
			this.$el.html(this.template({data: tem}));
		},
		send: function(e){
			if(e.which == 13){
				console.log('enter is pressed');
				var inputMessage = $(e.currentTarget).val()
				insertChat("me",inputMessage);
				$(e.currentTarget).val("");
				$.ajax({
					type: 'POST',
					url: '/messages',
					data:{
						message: inputMessage,
						partner_id: currentUser.partner.attributes.id 
					},
					success:function(){
						console.log("successfully send the message");
					}

				})
			}
		},
		scrollToBottom: function(){
			var frame = $('#chat-window .frame')[0];
			frame.scrollTop = frame.scrollHeight - frame.clientHeight;
		}
	});
	chatWindow = new ChatWindow();


	SearchPeopleBar = Backbone.View.extend({
		el:'#search-people',
		events:{
			'keyup #search-people-input':'scrollToPeople'
		},
		scrollToPeople: function(e){
			_.each($('.card-user-bio h4'),function(item){
				if($('#search-people-input').val() != ""){
					if($(item).text().match(new RegExp("^"+ $('#search-people-input').val() + ".*"))){
						console.log("matched found" + $(item).text());
						$('#people')[0].scrollTop = $(item).parent().parent().position().top;
					}
					
				}
				
			})
		}

	});

	searchPeopleBar = new SearchPeopleBar();
// ---------------MODEL---------------
	User = Backbone.Model.extend({

	});
	currentUser = new User();
	currentUser.attributes = $('#current-user').data('value');

// --------------COLLECTION-----------
	Users = Backbone.Collection.extend({
		model: User
	});
	users = new Users();
	users.add($('#users').data('value'));


	cardUser = new CardUser();



// Global subsciption 
	if((App.cable.subscriptions.subscriptions.find(function(e){return JSON.parse(e.identifier).group_id == "global" }))==undefined) {
		App.cable.subscriptions.create({channel: "RoomChannel", group_id: "global"},{
			connected: function(){

			},
			disconnected: function(){

			},
			received: function(data){
				console.log(data.user_id + " is online");
				var labelName = $('h4[data-user-id="'+data.user_id+'"]');
				labelName.next().text("online");
				labelName.next().css("color","#69d92e");
			}
		});

	}



	// ---------------misc---------------------~~~~~~~~~~~spaghetti code zone~~~~~~~~~
	// button
	var blinking = {};
	$('.button').on('click',function(e){
		// clear search-people-input
		$('#search-people-input').val("");
		e.preventDefault();
		// get the user from the collection using id
		currentUser.partner = users.get(parseInt($(e.currentTarget).data('person')));
		var partnerForThisGroup = currentUser.partner;
		chatWindow.render();

		


		// append all historical messages exchanged between currentuser and the clicked partner
		$.ajax({
			type: 'GET',
			url: '/messages/all_messages_in_particular_group',
			data:{
				partner_id: currentUser.partner.attributes.id
			},
			success: function(resp){
				if(resp[0]){ // if resp is an array, then resp must be an array of messages
					_.each(resp, function(message){
						if(message.user_id == currentUser.attributes.id){
							insertChat("me",message.content,0,true);
						}else{
							insertChat("partner",message.content,0,true);
						}
					});
				}

				// End blinking
				if(blinking[(resp.id || resp[0].group_id)]){
					clearInterval(blinking[(resp.id || resp[0].group_id)]);
					console.log(JSON.stringify(blinking)+"cleared interval. resp: " + (resp.id || resp[0].group_id));
					blinking[(resp.id || resp[0].group_id)] = null;
					console.log("partner for this grp:"+partnerForThisGroup);
					$('h4[data-user-id="'+partnerForThisGroup.attributes.id+'"]').css({
						"color":"inherit"
					});
					
				}
				// create websocket connection if it does not already exists
				if((App.cable.subscriptions.subscriptions.find(function(e){return JSON.parse(e.identifier).group_id == (resp.id ||resp[0].group_id) }))==undefined) {
					App.room = App.cable.subscriptions.create({channel: "RoomChannel",group_id: (resp.id || resp[0].group_id)},{
					  connected: function(){
					    // # Called when the subscription is ready for use on the server
					  	console.log("connected from group " + (resp.id || resp[0].group_id))
					  },

					  disconnected: function(){
					    // # Called when the subscription has been terminated by the server
					  	console.log("disconnected from group " + (resp.id || resp[0].group_id))
					  },

					  received: function(message){
					    // # Called when there's incoming data on the websocket for this channel
					    console.log('received'+message);
					  	if((message.user_id !== currentUser.attributes.id) && (currentUser.partner.attributes.id == message.user_id)){ 
							insertChat("partner",message.content);
						}

						// notify if not chatting with this partner
						if(currentUser.partner.attributes.id !== partnerForThisGroup.attributes.id){
							console.log("notification from partner " + partnerForThisGroup.attributes.name )
							blinking[(resp.id || resp[0].group_id)] = setInterval(function(){
								var labelName = $('h4[data-user-id="'+partnerForThisGroup.attributes.id+'"]');
								if(labelName.css("color")=="rgb(255, 0, 0)"){
									labelName.css("color","inherit");
								}else{
									labelName.css("color","rgb(255, 0, 0)");	
								}
								
							},300);
							console.log("blinking hash added: " + JSON.stringify(blinking));
						}
					  }
					});

				}
				




			}
		})
	});


	



});
	function formatAMPM(date) {
	    var hours = date.getHours();
	    var minutes = date.getMinutes();
	    var ampm = hours >= 12 ? 'PM' : 'AM';
	    hours = hours % 12;
	    hours = hours ? hours : 12; // the hour '0' should be '12'
	    minutes = minutes < 10 ? '0'+minutes : minutes;
	    var strTime = hours + ':' + minutes + ' ' + ampm;
	    return strTime;
	}            

	//-- No use time. It is a javaScript effect.
	function insertChat(who,text,time,previous){
		time = null ? 0 : time;
		previous = null ? false : previous;
	    var control = "";
	    var date;
	    if(previous==false){
		    date = formatAMPM(new Date());
	    }else{
	    	date = "some time ago";
	    }
	    
	    if (who == "me"){
	        
	        control = '<li style="width:100%">' +
	                        '<div class="msj macro">' +
	                            '<div class="text text-l">' +
	                                '<p>'+ "<span style='color:#000099;'>Me: </span>" + text +'</p>' +
	                                '<p><small>'+date+'</small></p>' +
	                            '</div>' +
	                        '</div>' +
	                    '</li>';                    
	    }else{
	        control = '<li style="width:100%;">' +
	                        '<div class="msj-rta macro">' +
	                            '<div class="text text-r">' +
	                                '<p>'+"<span style='color:#006600;'>"+currentUser.partner.attributes.name+"</span>" +": "+text+'</p>' +
	                                '<p><small>'+date+'</small></p>' +
	                            '</div>' +
	                  '</li>';
	    }
	    setTimeout(
	        function(){                        
	            $("#chat-screen").append(control);

			    // scrollToBottom for chatWindow
			    chatWindow.scrollToBottom();
	        }, time);
	    
	}

	function resetChat(){
	    $("ul").empty();
	}

	

	//-- Clear Chat
	resetChat();