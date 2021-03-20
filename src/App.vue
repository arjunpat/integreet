<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      v-if="!started"
    >
      <div class="d-flex align-center">
        <h1>Integreet</h1>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view @joinedRoom="started = true" @leftRoom="started = false"/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    started: false
    //
  }),
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');

#app {
  font-family: 'Poppins', sans-serif;
}


</style>