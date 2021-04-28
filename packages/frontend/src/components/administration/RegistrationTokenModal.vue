<template>
  <div id="registrationtokenmodal">
    <b-modal v-model="active" scroll="keep">
      <div class="box">
        <h1 class="title">Neuer Registrierungs Token</h1>
        <div class="container">
          <div class="notification is-light has-text-centered has-text-weight-bold">
            {{ token }}
          </div>
        </div>
        <div class="content">
          <p>
            Du hast einen neuen Registrierungstoken angefordert. Dieser ist für
            {{ this.lifetime }} gültig. Diesen Token kannst du entweder selber
            benutzten um ein weiteres Gerät zu registrieren (eigener neuer
            Benutzername ist notwendig!) oder ihn an deine Freunde:innen
            schicken, damit sie ebenfalls den Service konfigurieren können.
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
                  Klicke hier, um den Link in deinen Zwischenspeicher zu speichern. Teile diesen
                  mit der Person, welche du als weiteren Benutzer hinzufügen möchstest oder öffne
                  diesen selber in einem neuen Browsertab.
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
                  <strong>QR-Code anzeigen</strong>
                  <br />
                  Klicke hier, um den Link als QR-Code anzuzeigen. Somit kannst du beispielweise
                  den Token einfacher auf deinem Handy benutzten.
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
          notifySuccess('Link kopiert!');
        })
        .catch((error) => {
          console.error(error);
          notifyFailure('Link konnte nicht kopiert werden!');
        });
    },

    onClickShowORC() {
      // Select canvas element
      const qrCanvas = document.getElementById('qrcanvas');

      // Create qr code
      QRCode.toCanvas(qrCanvas, this.link, (error) => {
        if (error) {
          console.error(error);
          notifyFailure('QRCode konnte nicht erstellt werden');
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
