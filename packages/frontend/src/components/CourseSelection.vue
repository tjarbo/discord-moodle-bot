<template>
  <div id="CourseSelection">
    <h3>Kurse mit aktivierten Benachrichtigungen</h3>
    <form>
        <div v-for="course in courses" :key="course.courseId">
            <input type="checkbox" v-model="course.isActive" v-bind:id="course.name"
            v-bind:value="course.courseId" v-on:change="onChange(course.courseId, $event)">
            <label v-bind:for="course.name">{{course.name}}</label><br>
        </div>
    </form>
    <p v-bind:class="{error}"> {{result}} </p>
  </div>
</template>

<script>
export default {
  created() {
    // Import course array at loading time
    this.$store.dispatch('courseList')
      .then((response) => {
        this.courses = response.data;
      })
      .catch((err) => {
        // Build error object for display
        const list = [{
          courseId: 0,
          name: `Error: ${err.response.data.message} (Code ${err.response.status})`,
          isActive: false,
        }];
        this.courses = list;
      });
  },
  name: 'CourseSelection',
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
      this.$store.dispatch('setCourse', courseUpdate)
        .then((response) => {
          const msg = `Aktualisierung erfolgreich! (Code ${response.status})`;
          this.error = false;
          this.result = msg;
          // Delete Message after 2 seconds
          setTimeout(() => { this.result = ''; }, 2000);
        })
        .catch((err) => {
          const msg = `Error: ${err.response.data.message} (Code ${err.response.status})`;
          this.error = true;
          this.result = msg;
          // Delete Message after 2 seconds
          setTimeout(() => { this.result = ''; }, 2000);
        });
    },
  },
};

</script>

<style scoped>
input[type=checkbox] {
  margin-top: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
}
p {
    margin: 10px;
    color: green;
}
.error {
    color: red;
}
h3 {
    margin-bottom: 0px;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
