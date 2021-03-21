<template>
  <v-container id="worldContainer" fluid :style="{backgroundColor: containerBackground}">
    <v-fade-transition>
      <v-row justify="center" style="margin-top: 20vh;" v-if="!usernameSet">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card>
            <v-card-title class="font-weight-bold" style="background-color: #57c2f2; height: 100px">
              <v-row justify="center">
              <v-img src="@/assets/logo.png" max-width="60"></v-img>
              <h1 id="main-logo" style="margin-top: 15px;" >
              INTEGREET
              </h1>
              </v-row>
            </v-card-title>
            <v-card-text class="mt-3">
            <v-text-field
              v-model="username"
              label="Your name"
              class="mb-2"
              outlined
              hide-details
              autocomplete="off"
            ></v-text-field>
            <v-text-field
              v-model="roomId"
              label="Room name"
              class="mb-4"
              outlined
              hide-details
              autocomplete="off"
            ></v-text-field>
            <v-btn block @click="setUsername">{{ !client ? 'Enter Room' : 'Leave Room' }}</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-fade-transition>

    <v-btn v-if="usernameSet" @click="leave()" depressed color="error" style="position: absolute; right: 10px; top: 10px; z-index: 100;">Leave</v-btn>

    <VideoDisplay v-if="localUser.media._videoTrack" :user="localUser" self />

    <VideoDisplay v-for="user in userMap" :key="user.uid" :user="user" :local-user-pos="localUserPos" />

    <WorldBackground :local-user-pos="localUserPos" :world="world"/>
  </v-container>
</template>

<style scoped>
</style>

<script>
import AgoraRTC from 'agora-rtc-sdk-ng'
import World from '@/store/World';
import VideoDisplay from '@/components/VideoDisplay'
import WorldBackground from '@/components/WorldBackground'

export default {
  name: 'Home',

  components: {
    VideoDisplay,
    WorldBackground,
  },

  watch: {
    userMap: {
      handler() {
        console.log('usermap changed: ')
        this.setVolumes();
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
      channel: null,
      localAudioTrack: null,
      localVideoTrack: null,
      usernameSet: false,
      username: '',
      audioTrackByUID: {},
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
      roomId: '',
      world: null,
      oldPos: {
        x: 100,
        y: 100,
      },
      containerBackground: '#75dfff',
    }
  },

  computed: {
    userMap() {
      return this.world ? this.world.userMap : null
    },
    localUserPos() {
      return { x: this.localUser.info.x, y: this.localUser.info.y }
    }
  },

  methods: {
    leave() {
      this.$router.go()
    },
    setUsername() {
      this.usernameSet = true
      this.localUser.info.username = this.username
      this.joinChannel()
      this.$emit("joinedRoom")
      this.started = true
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

      this.setVolumes();

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

    distance(x0, y0, x1, y1) {
      return Math.sqrt((x0 - x1) ** 2, (y0 - y1) ** 2);
    },

    setVolumes() {
      let { x, y } = this.localUserPos;
      // for (let uid in this.audioTrackByUID) {
      //   if (!this.userMap[uid]) {
      //     this.audioTrackByUID[uid].pause();
      //     delete this.audioTrackByUID[uid];
      //   }
      // }
      for (let uid in this.userMap) {
        if (!this.userMap[uid].media || !this.userMap[uid].info || typeof this.userMap[uid].info.x !== 'number' || !this.userMap[uid].media._audioTrack) continue;
        if (!this.audioTrackByUID[uid]) {
          this.audioTrackByUID[uid] = this.userMap[uid].media._audioTrack;
          this.audioTrackByUID[uid].play();
        }
        let d = this.distance(x, y, this.userMap[uid].info.x, this.userMap[uid].info.y);
        let volume = Math.max(0, (500 - d) / 500);
        //console.log('volume: ' + volume);
        this.audioTrackByUID[uid].setVolume(volume * 1000);
      }
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Noto+Sans&display=swap');

#worldContainer {
  position: relative; 
  overflow: hidden; 
  height: 100vh; 
  width: 100vw;
}

#main-logo {
  font-family: 'Poppins';
  color: white;
  font-size: 30px;
}

</style>
