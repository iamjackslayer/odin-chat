function formatAMPM(e){var t=e.getHours(),r=e.getMinutes(),s=t>=12?"PM":"AM";return t%=12,t=t||12,r=r<10?"0"+r:r,t+":"+r+" "+s}function insertChat(e,t,r,s){r=r,s=s;var n,a="";n=0==s?formatAMPM(new Date):"some time ago",a="me"==e?'<li style="width:100%"><div class="msj macro"><div class="text text-l"><p><span style=\'color:#000099;\'>Me: </span>'+t+"</p><p><small>"+n+"</small></p></div></div></li>":'<li style="width:100%;"><div class="msj-rta macro"><div class="text text-r"><p><span style=\'color:#006600;\'>'+currentUser.partner.attributes.name+"</span>: "+t+"</p><p><small>"+n+"</small></p></div></li>",setTimeout(function(){$("#chat-screen").append(a),chatWindow.scrollToBottom()},r)}function resetChat(){$("ul").empty()}_.templateSettings={interpolate:/\{\{\=(.+?)\}\}/g,evaluate:/\{\{(.+?)\}\}/g};var CardUser,cardUser,ChatWindow,chatWindow,user,currentUser,User,users,Users;$(document).ready(function(){CardUser=Backbone.View.extend({el:"#people",template:_.template($("#card-user-template").html()),initialize:function(){this.render()},render:function(){console.log(users),this.$el.append(this.template({users:users.models}))}}),ChatWindow=Backbone.View.extend({el:"#chat-window",events:{"keypress #userInput":"send"},template:_.template($("#chat-window-template").html()),render:function(){this.$el.html(this.template({partner:currentUser.partner}))},send:function(e){if(13==e.which){console.log("enter is pressed");var t=$(e.currentTarget).val();insertChat("me",t),$(e.currentTarget).val(""),$.ajax({type:"POST",url:"/messages",data:{message:t,partner_id:currentUser.partner.attributes.id},success:function(){console.log("successfully send the message")}})}},scrollToBottom:function(){var e=$("#chat-window .frame")[0];e.scrollTop=e.scrollHeight-e.clientHeight}}),chatWindow=new ChatWindow,User=Backbone.Model.extend({}),currentUser=new User,currentUser.attributes=$("#current-user").data("value"),Users=Backbone.Collection.extend({model:User}),users=new Users,users.add($("#users").data("value")),cardUser=new CardUser;var e={};$(".button").on("click",function(t){t.preventDefault(),currentUser.partner=users.get(parseInt($(t.currentTarget).data("person")));var r=currentUser.partner;chatWindow.render(),$.ajax({type:"GET",url:"/messages/all_messages_in_particular_group",data:{partner_id:currentUser.partner.attributes.id},success:function(t){t[0]&&_.each(t,function(e){e.user_id==currentUser.attributes.id?insertChat("me",e.content,0,!0):insertChat("partner",e.content,0,!0)}),e[t.id||t[0].group_id]&&(clearInterval(e[t.id||t[0].group_id]),console.log("cleared interval"),$('h4[data-user-id="'+r.attributes.id+'"]').css({color:"inherit"})),App.room=App.cable.subscriptions.create({channel:"RoomChannel",group_id:t.id||t[0].group_id},{connected:function(){console.log("connected from group "+(t.id||t[0].group_id))},disconnected:function(){console.log("disconnected from group "+(t.id||t[0].group_id))},received:function(s){s.user_id!==currentUser.attributes.id&&currentUser.partner.attributes.id==s.user_id&&insertChat("partner",s.content),currentUser.partner.attributes.id!==r.attributes.id&&(console.log("notification from partner "+r.attributes.name),e[t.id||t[0].group_id]=setInterval(function(){var e=$('h4[data-user-id="'+r.attributes.id+'"]');"rgb(255, 0, 0)"==e.css("color")?e.css("color","inherit"):e.css("color","rgb(255, 0, 0)")},300))}})}})})}),resetChat();