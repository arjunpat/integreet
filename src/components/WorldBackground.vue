<template>
  <div class="backgroundasdf" :style="backgroundStyle">
    <svg :width="this.world ? this.world.width : 0" :height="this.world ? this.world.height : 0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity=".5" />
        </filter>
      </defs>

      <template v-for="({ type, x, y, width, height }, i) in objects">
        <g v-if="type === 'table'" :key="i">
          <!-- Table -->
          <rect style="filter:url(#shadow);" :x="x" :y="y" :width="width" :height="height" rx="10" ry="10" fill="#fadfb1"/>
          <circle style="filter:url(#shadow);" :cx="x - 20 - personWidth/2" :cy="y + height/4" :r="personWidth / 4" fill="#f77265"/>
          <circle style="filter:url(#shadow);" :cx="x - 20 - personWidth/2" :cy="y + 3*height/4" :r="personWidth / 4" fill="#f77265"/>
          <circle style="filter:url(#shadow);" :cx="x + width + 20 + personWidth/2" :cy="y + height/4" :r="personWidth / 4" fill="#f77265"/>
          <circle style="filter:url(#shadow);" :cx="x + width + 20 + personWidth/2" :cy="y + 3*height/4" :r="personWidth / 4" fill="#f77265"/>
        </g>
      </template>
    </svg>
  </div>
</template>

<style scoped>
.backgroundasdf {
  position: absolute;
  z-index: 1;
  background:
  linear-gradient(135deg, lightblue 21px, #d9ecff 22px, #d9ecff 24px, transparent 24px, transparent 67px, #d9ecff 67px, #d9ecff 69px, transparent 69px),
  linear-gradient(225deg, lightblue 21px, #d9ecff 22px, #d9ecff 24px, transparent 24px, transparent 67px, #d9ecff 67px, #d9ecff 69px, transparent 69px)0 64px;
  background-color:lightblue;
  background-size: 64px 128px;
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
      personWidth: 200,
      objects: [
        {
          type: 'table',
          x: 300,
          y: 400,
          width: 300,
          height: 600,
        },
        {
          type: 'table',
          x: 1400,
          y: 400,
          width: 300,
          height: 600,
        }
      ],
    }
  },

  computed: {
    backgroundStyle() {
      if (!this.world) return { left: '0', top: '0' }

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