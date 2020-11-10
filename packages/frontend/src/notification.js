import { NotificationProgrammatic as Notification } from 'buefy';

const defaultOptions = {
  duration: 5000,
  position: 'is-bottom-right',
  hasIcon: false,
};

export function notifyFailure(message) {
  Notification.open({
    ...defaultOptions,
    type: 'is-danger',
    message,
  });
}

export function notifySuccess(message) {
  Notification.open({
    ...defaultOptions,
    type: 'is-success',
    message,
  });
}
