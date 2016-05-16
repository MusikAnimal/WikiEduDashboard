// Requirements
//----------------------------------------

import McFly from 'mcfly';
let Flux = new McFly();

// Data
//----------------------------------------

let _notifications = [];


// Private Methods
//----------------------------------------

let addNotification = function(notification) {
  _notifications.push(notification);
  return NotificationStore.emitChange();
};

let removeNotification = function(notification) {
  _.pull(_notifications, notification);
  return NotificationStore.emitChange();
};


// Store
//----------------------------------------

var NotificationStore = Flux.createStore({
  clearNotifications() {
    return _notifications.length = 0;
  },
  getNotifications() {
    return _notifications;
  }
}
, function(payload) {
  switch(payload.actionType) {
    case 'REMOVE_NOTIFICATION':
      removeNotification(payload.notification);
      break;
    case 'ADD_NOTIFICATION':
      addNotification(payload.notification);
      break;
    case 'API_FAIL':
      let { data } = payload;
      let notification = {};
      notification.closable = true;
      notification.type = "error";
      if (data.responseJSON && data.responseJSON.error) {
        notification.message = data.responseJSON.error;
      } else {
        notification.message = data.statusText;
      }
      addNotification(notification);
      break;
  }

  return true;
});


// Exports
//----------------------------------------

export default NotificationStore;
