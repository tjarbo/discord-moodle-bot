<template>
  <div id="startloadingview">
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            <h3 class="title has-text-black">Fancy Moodle Discord Bot</h3>
            <hr class="login-hr" />
            <p class="subtitle has-text-black">{{ $t('views.startLoading.subtitle') }}</p>
            <div class="box has-text-left">
              <figure class="image is-128x128">
                <img class="is-rounded" src="../assets/FMDB_logo.png" />
              <b-loading active :is-full-page="0 === 1"></b-loading>
              </figure>
            </div>
            <p class="has-text-link">
              <a
                class="has-text-link"
                href="https://github.com/tjarbo/discord-moodle-bot/"
              >Github Repository</a> &nbsp;·&nbsp;
              <a
                class="has-text-link"
                href="https://github.com/tjarbo/discord-moodle-bot/wiki"
              >{{ $t('views.startLoading.needHelpLink') }}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'StartLoadingView',
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
  height: 318px;
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
