<template>
  <div class="backgroundasdf" :style="backgroundStyle">
  </div>
</template>

<style scoped>
.backgroundasdf {
  background-color: lightblue;
  position: absolute;
  z-index: 1;
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

      console.log('left: ', this.localUserX - window.innerWidth/2)

      return {
        left: window.innerWidth/2 - this.localUserX + 'px',
        top: window.innerHeight/2 - this.localUserY + 'px',
        width: this.world.width + 'px',
        height: this.world.height + 'px',
        borderRadius: '25px'
      }
    },
    localUserX() {
      return this.localUserPos.x
    },
    localUserY() {
      return this.localUserPos.y
    },
  },
}
</script>