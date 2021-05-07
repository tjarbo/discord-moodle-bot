<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
      <div class="container has-text-centered">
        <div class="column is-4 is-offset-4">
          <h3 class="title has-text-black">{{ title }}</h3>
          <hr class="login-hr" />
          <p class="subtitle has-text-black">{{ subtitle }}</p>
          <div class="box has-text-left">
            <figure class="image is-128x128">
              <img class="is-rounded" src="../assets/FMDB_logo.png" />
            </figure>
            <form class="has-text-centered container" @submit="onSubmit">
              <slot></slot>
            </form>
            <p class="has-text-link has-text-centered">
              <router-link :to="switchViewLink">{{switchViewText}}</router-link>
            </p>
          </div>
          <p class="has-text-link">
            <a
              class="has-text-link"
              href="https://github.com/tjarbo/discord-moodle-bot/"
              >Github Repository</a
            >
            &nbsp;·&nbsp;
            <a
              class="has-text-link"
              href="https://github.com/tjarbo/discord-moodle-bot/wiki"
              >{{ $t('layouts.authenticationLayout.needHelpLink') }}</a
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AuthenticationLayout',
  methods: {
    onSubmit(event) {
      this.$emit('submit', event);
    },
  },
  props: {
    title: String,
    subtitle: String,
    switchViewText: String,
    switchViewLink: String,
  },
};
</script>

<style scoped>
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

.box > p {
  margin-top: 1rem;
}
</style>
