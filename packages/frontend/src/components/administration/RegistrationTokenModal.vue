<template>
  <div id="registrationtokenmodal">
    <b-modal v-model="active" scroll="keep">
      <div class="box">
        <h1 class="title">{{ $t('components.registrationTokenModal.registrationTokenTitle') }}</h1>
        <div class="container">
          <div class="notification is-light has-text-centered has-text-weight-bold">
            {{ token }}
          </div>
        </div>
        <div class="content">
          <p>
            {{ $t('components.registrationTokenModal.registrationTokenContent', this.lifetime) }}
          </p>
        </div>
        <div class="container has-text-centered" v-show="displayQRC">
          <canvas id="qrcanvas"></canvas>
        </div>
        <a class="box" @click="onClickClipboard">
          <article class="media">
            <div class="media-left">
              <b-icon icon="paperclip" size="is-medium"></b-icon>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>{{ link }}</strong>
                  <br />
                  {{ $t('components.registrationTokenModal.clipboardContent') }}
                </p>
              </div>
            </div>
          </article>
        </a>
        <a class="box" @click="onClickShowORC">
          <article class="media">
            <div class="media-left">
             <b-icon icon="qrcode" size="is-medium"></b-icon>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>{{ $t('components.registrationTokenModal.qrCodeTitle') }}</strong>
                  <br />
                  {{ $t('components.registrationTokenModal.qrCodeContent') }}
                </p>
              </div>
            </div>
          </article>
        </a>
      </div>
    </b-modal>
  </div>
</template>

<script>
import QRCode from 'qrcode';
import { notifyFailure, notifySuccess } from '../../notification';

export default {
  name: 'RegistrationTokenModal',
  computed: {
    link() {
      return `${this.origin}/#/registration?token=${this.token}`;
    },
  },
  data: () => ({
    active: false,
    displayQRC: false,
    lifetime: '',
    origin: '',
    token: '',
  }),
  methods: {
    show(data) {
      // Save data received from caller (parent component)
      this.active = true;
      this.token = data.token;
      this.lifetime = data.lifetime;
      this.origin = data.origin;
    },

    onClickClipboard() {
      // Add link to user's clipboard
      navigator.clipboard.writeText(this.link)
        .then(() => {
          notifySuccess($t('components.registrationTokenModal.notifications.copiedLink'));
        })
        .catch((error) => {
          console.error(error);
          notifyFailure($t('components.registrationTokenModal.notifications.failedToCopyLink'));
        });
    },

    onClickShowORC() {
      // Select canvas element
      const qrCanvas = document.getElementById('qrcanvas');

      // Create qr code
      QRCode.toCanvas(qrCanvas, this.link, (error) => {
        if (error) {
          console.error(error);
          notifyFailure($t('components.registrationTokenModal.notifications.failedToCreateQrCode'));
        } else {
          // Show canvas element
          this.displayQRC = true;
        }
      });
    },
  },
};
</script>

<style>
</style>
