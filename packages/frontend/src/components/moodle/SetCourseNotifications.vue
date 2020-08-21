<template>
  <div id="setcoursenotifications">
    <article class="panel is-moodle">
      <b-loading :is-full-page="false" :active="coursesGetStatus.pending"></b-loading>
      <p class="panel-heading">Kurse mit aktivierten Benachrichtigungen:</p>
      <label class="panel-block" v-for="course in coursesGetData" :key="course.courseId">
        <input
          type="checkbox"
          v-model="course.isActive"
          v-bind:id="course.name"
          v-bind:value="course.courseId"
          v-on:change="onChange(course.courseId, $event)"
        />
        {{course.name}}
      </label>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { notifyFailure, notifySuccess } from '../../notification';

export default {
  name: 'SetCourseNotifications',
  created() {
    // Import course array at loading time
    this.$store
      .dispatch('fetchCourseList')
      .then(() => {})
      .catch((apiResponse) => {
        if (apiResponse.code) {
          notifyFailure(apiResponse.error[0].message);

          if (apiResponse.code === 401) {
            this.$router.push('/');
          }
        } else {
          // request failed locally - maybe no internet connection etc?
          notifyFailure(
            'Anfrage fehlgeschlagen! Bitte überprüfe deine Internetverbindung.',
          );
        }
      });
  },
  methods: {
    onChange(id, event) {
      // Update course on checkbox change
      const courseUpdate = { courseId: id, isActive: event.target.checked };
      this.$store
        .dispatch('setCourse', courseUpdate)
        .then(() => {
          console.log(event.target);
          notifySuccess(
            `Benachrichtigung für ${event.target.id} aktualisiert!`,
          );
        })
        .catch((apiResponse) => {
          if (apiResponse.code) {
            notifyFailure(apiResponse.error[0].message);

            if (apiResponse.code === 401) {
              this.$router.push('/');
            }
          } else {
            // request failed locally - maybe no internet connection etc?
            notifyFailure(
              'Anfrage fehlgeschlagen! Bitte überpüfe deine Internetverbindung.',
            );
          }
        });
    },
  },
  computed: {
    ...mapGetters(['coursesGetStatus', 'coursesGetData']),
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
