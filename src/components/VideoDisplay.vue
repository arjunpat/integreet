<template>
  <div v-if="user.info" :style="{ position: 'absolute', top: user.info.y + 'px', left: user.info.x + 'px' }">
    <svg :width="2*svgPadding + width" :height="2*svgPadding + height" :style="{ top: `-${svgPadding}px`, left: `-${svgPadding}px` }">
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
import { mapState } from 'vuex'

export default {
  name: 'VideoDisplay',

  props: {
    user: { type: Object, required: true },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
  },

  watch: {
    // Need videoTrack and audioTrack watchers to update each
    videoTrack: {
      handler(_, old) {
        if (this.mounted && this.videoTrack && !old) {
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
    ...mapState([ 'users' ]),
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
  },

  methods: {
    playVideo() {
      const vidContainer = this.$refs.vidContainer
      this.videoTrack.play(vidContainer)
    },
  },
}
</script>