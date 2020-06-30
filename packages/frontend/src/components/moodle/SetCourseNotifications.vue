<template>
  <div id="setcoursenotifications">
    <article class="panel is-moodle">
      <p class="panel-heading">Kurse mit aktivierten Benachrichtigungen:</p>
      <label class="panel-block" v-for="course in courses" :key="course.courseId">
        <input
          type="checkbox"
          v-model="course.isActive"
          v-bind:id="course.name"
          v-bind:value="course.courseId"
          v-on:change="onChange(course.courseId, $event)"
        />
        {{course.name}}
      </label>
      <p class="panel-block" v-if="result != ''" :class="{error}">
        <span>{{result}}</span>
      </p>
    </article>
  </div>
</template>

<script>
export default {
  created() {
    // Import course array at loading time
    this.$store
      .dispatch('getCourseList')
      .then((response) => {
        this.courses = response.data;
      })
      .catch((err) => {
        // Build error object for display
        const list = [
          {
            courseId: 0,
            name: `Error: ${err.response.data.message} (Code ${err.response.status})`,
            isActive: false,
          },
        ];
        this.courses = list;
      });
  },
  name: 'SetCourseNotifications',
  data: () => ({
    courses: [],
    result: '', // Displays result message if set
    error: false, // Sets result message color to red if true
  }),
  methods: {
    onChange(id, event) {
      // Update course on checkbox change
      this.result = '';
      const courseUpdate = { courseId: id, isActive: event.srcElement.checked };
      this.$store
        .dispatch('setCourse', courseUpdate)
        .then((response) => {
          const msg = `Aktualisierung erfolgreich! (Code ${response.status})`;
          this.error = false;
          this.result = msg;
          // Delete Message after 3 seconds
          setTimeout(() => {
            this.result = '';
          }, 3000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete Message after 3 seconds
          setTimeout(() => {
            this.result = '';
          }, 3000);
        });
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
