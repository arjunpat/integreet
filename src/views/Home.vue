<template>
  <v-container class="fill-height" style="position: relative;" fluid>
    <v-fade-transition>
      <v-row justify="center" v-if="!usernameSet">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card>
            <v-card-title class="font-weight-bold">Join Room</v-card-title>
            <v-card-text>
            <v-text-field
              v-model="username"
              label="Name"
              class="mb-4"
              outlined
              hide-details
              autocomplete="off"
            ></v-text-field>
            <v-btn fill @click="setUsername">{{ !client ? 'Join Room' : 'Leave Room' }}</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-fade-transition>

    <VideoDisplay v-if="localUser.media._videoTrack" :user="localUser" />

    <VideoDisplay v-for="user in userMap" :key="user.uid" :user="user" />
  </v-container>
</template>

<style scoped>
</style>

<script>
import AgoraRTC from 'agora-rtc-sdk-ng'
import World from '@/store/World';
import VideoDisplay from '@/components/VideoDisplay'

export default {
  name: 'Home',

  components: {
    VideoDisplay
  },

  watch: {
    userMap: {
      handler() {
        console.log('USERMAP: ', this.userMap)
        //this.$forceUpdate()
      },
    }
  },

  created() {
    AgoraRTC.setLogLevel(3)
  },

  destroyed() {
    //this.channel.leave()
    this.uninitializeEvents()
  },

  async beforeUnmount() {
    clearInterval(this.sendInfoInterval)
    await leaveChannel()
    await this.world.destroy()
  },

  data() {
    return {
      uid: null,
      client: null,
      messageClient: null,
      channel: null,
      localAudioTrack: null,
      localVideoTrack: null,
      usernameSet: false,
      username: '',
      localUser: {
        media: {
          _videoTrack: null,
        },
        info: {
          username: '',
          x: 100,
          y: 100,
        }
      },
      moveDir: { up: false, down: false, left: false, right: false },
      speed: 10,
      sendInfoInterval: null, 
      roomId: 'test-room',
      world: null,
      oldPos: {
        x: 100,
        y: 100,
      },
    }
  },

  computed: {
    userMap() {
      return this.world ? this.world.userMap : null
    },
  },

  methods: {
    setUsername() {
      this.usernameSet = true
      this.localUser.info.username = this.username
      this.joinChannel()
      this.$emit("joinedRoom")

      this.initializeEvents()
      window.requestAnimationFrame(this.animate)
    },
    initializeEvents() {
      document.addEventListener('keydown', this.keyUpDown)
      document.addEventListener('keyup', this.keyUpDown)
      window.addEventListener('blur', this.stopMovement)

      this.sendInfoInterval = setInterval(() => {
        if (this.world) {
          if (this.oldPos.x != this.localUser.info.x || this.oldPos.y != this.localUser.info.y) {
            this.world.move(this.localUser.info.x, this.localUser.info.y)
            this.oldPos.x = this.localUser.info.x
            this.oldPos.y = this.localUser.info.y
          }
        }
      }, 100)
    },
    uninitializeEvents() {
      document.removeEventListener('keydown', this.keyUpDown)
      document.removeEventListener('keyup', this.keyUpDown)
      window.removeEventListener('blur', this.stopMovement)
    },
    stopMovement() {
      this.moveDir = { up: false, down: false, left: false, right: false }
    },
    keyUpDown(e) {
      if (e.key === 'w' || e.key === 'ArrowUp') {
        this.moveDir.up = e.type === 'keydown'
      } 
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        this.moveDir.left = e.type === 'keydown'
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        this.moveDir.down = e.type === 'keydown'
      } 
      if (e.key === 'd' || e.key === 'ArrowRight') {
        this.moveDir.right = e.type === 'keydown'
      }
    },
    animate() {
      if (this.moveDir.up === this.moveDir.down) {
        this.localUser.info.velY = 0 
      } else {
        this.localUser.info.velY = this.moveDir.up ? -this.speed : this.speed
      }

      if (this.moveDir.left === this.moveDir.right) {
        this.localUser.info.velX = 0 
      } else {
        this.localUser.info.velX = this.moveDir.left ? -this.speed : this.speed
      }
      
      if (Math.abs(this.localUser.info.velX) === this.speed && Math.abs(this.localUser.info.velY) === this.speed) {
        // If moving diagonally, keep speed the same
        this.localUser.info.velX /= Math.sqrt(2)
        this.localUser.info.velY /= Math.sqrt(2)
      }
      this.localUser.info.x += this.localUser.info.velX
      this.localUser.info.y += this.localUser.info.velY

      //console.log(this.localUser.info.x, this.localUser.info.y)

      /*for (let user of Object.values(this.users)) {
        user.info.x += user.info.velX
        user.info.y += user.info.velY
        this.updateUser(user.info)
      }
      */

      window.requestAnimationFrame(this.animate)
    },
    async joinChannel() {
      const options = {
        appId: 'e29de10916734559a46f0fafb78d098d',
        channel: 'test_channel',
        token: '006e29de10916734559a46f0fafb78d098dIAAPe33H9hTSTaB6+sxKZuZfzLMLiXBQx7vz+uFNPDnVQ49auH4AAAAAEABfjXZEm3RXYAEAAQCedFdg',
      }
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      this.world = new World(this.roomId)

      this.client.on('user-published', async (user, mediaType) => {
        await this.client.subscribe(user, mediaType)
        if (user.audioTrack && user.videoTrack) {
          console.log('SETTING USER', user.uid)
          this.world.updateUser(user)
        }
      })

      this.client.on('user-unpublished', user => {
        this.world.removeUser(user.uid)
      })

      await Promise.all([
        this.client.join(options.appId, options.channel, options.token, this.uid),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack({ optimizationMode: 'motion' })
      ]).then(async values => {
        let _
        [this.uid, this.localAudioTrack, this.localVideoTrack] = values
        this.localUser.media._videoTrack = this.localVideoTrack
        await this.world.init(this.uid, {...this.localUser.info})

        this.world.onLocationChange(user => {
          //this.updateUser(user)
          // gives you the user that changed their location
          // "user" is of form { username, uid, x, y}
        });

        this.world.onUserJoin(user => {
          //this.updateUser(user)
          // gives you the user that has just joined the world
          // "user" is of form { username, uid, x, y}
        });

        // can call this.world.move(x, y) to set the current user's location
      });

      await this.client.publish([this.localAudioTrack, this.localVideoTrack])
    },
    async leaveChannel() {
      this.localAudioTrack && this.localAudioTrack.close()
      this.localVideoTrack && this.localVideoTrack.close()
      this.localAudioTrack = null
      this.localVideoTrack = null

      if (this.client) {
        this.client.remoteUsers.forEach(user => {
          const playerContainer = document.getElementById (user.uid)
          playerContainer && playerContainer.remove()
        })

        await this.client.leave()
        this.clearUsers()
        this.client = null
      }
    },
  },
}
</script>
