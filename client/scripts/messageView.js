var MessageView = {

  render: _.template(`
      <!--

      -->
      <div class="chat">
        <div
          class="username <%= Friends.isFriend(username) ? 'friend' : '' %>"
          data-username="<%- username %>">
          <%- username %>
        </div>
        <div><%- message %></div>
      </div>
      <!--
            -->
    `)

};