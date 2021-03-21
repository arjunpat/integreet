<template>
  <div class="backgroundasdf" :style="backgroundStyle">
  </div>
</template>

<style scoped>
.backgroundasdf {
  background-color: lightblue;
  position: 'absolute';
  left: 100px;
}

</style>

<script>
import World from '@/store/World'

export default {
  name: 'WorldBackground',

  props: {
    localUserPos: { type: Object, required: true },
    world: { type: World, default: null },
  },

  watch: {
    /*world: {
      handler() {
        if (this.world) {

        }
      },
    }*/
  },

  data() {
    return {

    }
  },

  computed: {
    backgroundStyle() {
      if (!this.world) return null

      return {
        //left: this.localUserPos.x - window.innerWidth/2,
        //top: this.localUserPos.y - window.innerHeight/2,
        width: this.world.width + 'px',
        height: this.world.height + 'px',
      }
    },
  },
}
</script>