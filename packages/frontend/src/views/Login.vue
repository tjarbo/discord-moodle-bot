<template>
  <div id="loginview">
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            <h3 class="title has-text-black">Fancy Moodle Discord Bot</h3>
            <hr class="login-hr" />
            <p class="subtitle has-text-black">Melde dich an, um fortzufahren!</p>
            <div class="box has-text-left">
              <figure class="image is-128x128">
                <img class="is-rounded" src="../assets/FMDB_logo.png" />
              </figure>
              <form class="has-text-centered container" @submit="onSubmit">
                <b-loading :is-full-page="false" :active="authGetStatus.pending"></b-loading>
                <div class="field">
                  <div class="control">
                    <input
                      autofocus
                      class="input is-large"
                      id="discordusername"
                      placeholder="username#0000"
                      type="text"
                      v-model="form.username"
                    />
                  </div>
                </div>

                <div class="field">
                  <div class="control">
                    <input
                      class="input is-large"
                      id="token"
                      placeholder="Dein Token"
                      type="password"
                      v-model="form.token"
                      :disabled="tokenInputDisabled"
                    />
                  </div>
                </div>
                <div class="field">
                  <div class="control">
                    <button
                      class="button is-block is-primary is-large is-fullwidth is-marginless"
                      :disabled="$v.$invalid"
                    >{{form.submitButtonText}}</button>
                  </div>
                </div>
              </form>
            </div>
            <p class="has-text-link">
              <a
                class="has-text-link"
                href="https://github.com/tjarbo/discord-moodle-bot/"
              >Github Repository</a> &nbsp;·&nbsp;
              <a
                class="has-text-link"
                href="https://github.com/tjarbo/discord-moodle-bot/wiki"
              >Brauchst du Hilfe?</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, helpers } from 'vuelidate/lib/validators';
import { notifyFailure, notifySuccess } from '../notification';

const usernameRegex = helpers.regex('usernameRegex', /^[\w\s]+#\d{4}$/);

export default {
  name: 'LoginView',
  data: () => ({
    form: {
      token: '',
      username: '',
      submitButtonText: 'Token anfordern',
    },
    tokenInputDisabled: true,
  }),
  methods: {
    onSubmit(event) {
      event.preventDefault();
      // request token in first case
      if (this.tokenInputDisabled) {
        this.$store
          .dispatch('requestToken', this.form.username)
          .then(() => {
            // token request was successful
            this.tokenInputDisabled = false;
            this.form.submitButtonText = 'Anmelden';

            notifySuccess('Token wurde erfolgreich versendet!');
          })
          .catch((apiResponse) => {
            // token request failed
            this.tokenInputDisabled = true;
            this.form.submitButtonText = 'Token anfordern';

            if (apiResponse.code) {
              notifyFailure(apiResponse.error[0].message);
            } else {
              // request failed locally - maybe no internet connection etc?
              notifyFailure(
                'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
              );
            }
          });

        // login with token in the other case
      } else {
        // create object with login credentials
        const credentials = {
          username: this.form.username,
          token: this.form.token,
        };
        this.$store
          .dispatch('loginWithToken', credentials)
          .then(() => {
            // login was successful
            this.tokenInputDisabled = true;
            this.$router.push('dashboard');

            notifySuccess('Anmeldung war erfolgreich!');
          })
          .catch((apiResponse) => {
            // login failed
            this.tokenInputDisabled = false;

            if (!apiResponse.code) {
              // request failed locally - maybe no internet connection etc?
              notifyFailure(
                'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
              );
            } else {
              notifyFailure(apiResponse.error[0].message);
            }
          });
      }
    },
  },
  computed: {
    ...mapGetters(['authGetStatus']),
  },
  validations: {
    form: {
      username: {
        required,
        usernameRegex,
      },
    },
  },
};
</script>

<style scoped>
.warning-text {
  color: rgb(202, 60, 60);
}
.logo {
  width: 300px;
}

figure.image {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  margin-top: -70px;
  padding-bottom: 20px;
}

figure img {
  padding: 5px;
  background: #fff;
  border-radius: 50%;
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}
.box {
  margin-top: 5rem;
}
#loginview {
  text-align: center;
}

.warning-text {
  margin: 20px;
  display: block;
  text-decoration: underline;
}

.navbar {
  overflow: hidden;
  background-color: #4e5f67;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
