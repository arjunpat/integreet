<template>
  <div id="container" v-show="user.media && user.info" :style="containerStyle">
    <svg v-if="user.info" :width="2*svgPadding + width" :height="2*svgPadding + height" :style="{ top: `-${svgPadding}px`, left: `-${svgPadding}px` }">
      <path id="curve" fill="transparent" :d="svgPath"/>
      <text width="100%" :dy="bottomText ? 20 : -5">
        <textPath textLength="0" startOffset="50%" text-anchor="middle" xlink:href="#curve">{{ user.info.username }}</textPath>
      </text>

      <rectangle x="0" y="0" width="200" height="200" fill="gray" />
    </svg>
    <div ref="vidContainer" class="vid-container" :style="{ width: width+'px', height: height+'px' }"></div>
  </div>
</template>

<style scoped>
#container {
  transition: top 0.1s, left 0.1s;
  z-index: 5;
}
/* if have time: do this by watching the x and y vars and update accordingly based on the old value */

.vid-container {
  border-radius: 50%;
  border: 3px solid;
  overflow: hidden;
}

text {
  font-size: 20px;
}

svg {
  position: absolute;
}
</style>

<script>
export default {
  name: 'VideoDisplay',

  props: {
    user: { type: Object, required: true },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
    self: { type: Boolean, default: false },
    localUserPos: { type: Object, default: null }
  },

  watch: {
    // Need videoTrack and audioTrack watchers to update each
    videoTrack: {
      handler(_, old) {
        if (this.$refs.vidContainer && this.videoTrack && !old) {
          this.playVideo()
        }
      },
      immediate: true,
    },
    audioTrack: {
      handler(_, old) {
        if (this.audioTrack && !old) {
          this.audioTrack.play()
        }
      },
      immediate: true,
    },
  },
  
  mounted() {
    this.mounted = true
    if (this.videoTrack) {
      this.playVideo()
    }
  },

  data() {
    return {
      mounted: false,
      svgPadding: 50, // How much padding to put around the svg to make sure text is not clipped
      bottomText: false,
    }
  },

  computed: {
    videoTrack() {
      return this.user.media ? this.user.media._videoTrack : null
    },
    audioTrack() {
      return this.user.media ? this.user.media._audioTrack : null
    },
    svgPath() {
      const { width, height, svgPadding, bottomText } = this

      if (bottomText) {
        // Lower semi-circle
        return `M ${svgPadding} ${svgPadding+height/2} A ${width/2} ${height/2}, 0, 0 0, ${svgPadding + width} ${svgPadding+height/2}`
      } else {
        // Upper semi-circle
        return `M ${svgPadding} ${svgPadding + height/2} A ${width/2} ${height/2}, 0, 1 1, ${svgPadding+width} ${svgPadding + height/2}`
      }
    },
    containerStyle() {
      if (!this.user.info) return null
      
      //console.log(window.innerWidth, window.innerHeight)
      const localUserX = window.innerWidth/2
      const localUserY = window.innerHeight/2
      if (this.self) {
        return { position: 'absolute', left: localUserX + 'px', top: localUserY + 'px', transform: `translate(${-this.width/2}px, ${-this.height/2}px)`}
      } else {
        const curUserX = this.user.info.x - this.localUserPos.x + localUserX
        const curUserY = this.user.info.y - this.localUserPos.y + localUserY
        return { position: 'absolute', left: curUserX + 'px', top: curUserY + 'px', transform: `translate(${-this.width/2}px, ${-this.height/2}px)` }
      }
    },
  },

  methods: {
    playVideo() {
      this.videoTrack.play(this.$refs.vidContainer)
    },
  },
}
</script>