import AgoraRTM from 'agora-rtm-sdk';
import Vue from 'vue';

function send(json) {

}

function stringify(json) {
  Object.keys(json).forEach(key => {
    json[key] = '' + json[key]
  })
  return json
}

function parseAttrs(attrs) {
  for (let key of Object.keys(attrs)) {
    if (!isNaN(attrs[key])) {
      attrs[key] = parseFloat(attrs[key])
    }
  }
  return attrs
}

class World {
  constructor(world_uid) {
    this.userMap = {};
    this.worldUid = world_uid;
    this.width = 2000
    this.height = 2000
  }

  async destroy() {
    this.channel && this.channel.leave()
    this.messagingClient && this.messagingClient.logout();
  }

  updateUserAttrs(uid) {
    this.messagingClient.getUserAttributes(uid).then(attrs => {
      parseAttrs(attrs)
      this.updateUser({ ...attrs, uid  })
    })
  }

  updateUser(user) {
    if (!this.userMap[user.uid]) {
      Vue.set(this.userMap, user.uid, {media: null, info: null})
    } 

    if (user.hasOwnProperty('_videoTrack')) {
      this.userMap[user.uid].media = { ...this.userMap[user.uid].media, ...user }
      //Vue.set(this.userMap[user.uid], 'media', { ...this.userMap[user.uid].media, ...user })
    } else {
      this.userMap[user.uid].info = { ...this.userMap[user.uid].info, ...user }
      //Vue.set(this.userMap[user.uid], 'info', { ...this.userMap[user.uid].info, ...user })
    }

    console.log('USERMAP IS ', this.userMap)
  }

  removeUser(uid) {
    Vue.delete(this.userMap, uid)
  }

  handleMessage(data) {
    if (data.type === 'updated-attrs') {
      this.updateUserAttrs(data.uid)
    }

    /*if (data.type === 'user') {
      if (this.userMap[data.uid]) {
        if (this.locationChangeHandler)
          this.locationChangeHandler(data);
      } else {
        if (this.userJoinHandler)
          this.userJoinHandler(data);
      }
      //this.updateUser(data)
      //this.userMap[data.uid] = data;
      console.log('SET USERSE TOO: ', this.userMap)
    }*/
  }

  move(x, y) {
    if (this.channel) {
      this.messagingClient.addOrUpdateLocalUserAttributes(stringify({ x, y })).then(() => {
        this.channel.sendMessage({
          text: JSON.stringify({ type: 'updated-attrs' })
        })
      })
    }
  }

  init(uid, userData) {
    return new Promise((resolve, reject) => {
      this.messagingClient = AgoraRTM.createInstance('4b7e608f84004ea2acd537eda95f6bf8', { logFilter: AgoraRTM.LOG_FILTER_ERROR });

      this.messagingClient.on('ConnectionStateChanged', (newState, reason) => {
        console.log('on connection state changed to ' + newState + ' reason: ' + reason);
      });

      this.messagingClient.login({ token: null, uid: `${uid}` }).then(async () => {
        console.log('AgoraRTM client login success');

        // Set local attributes
        await this.messagingClient.setLocalUserAttributes(stringify(userData))

        // Join channel
        this.channel = this.messagingClient.createChannel(this.worldUid);
        this.channel.join().then(() => {
          console.log("You joined channel successfully");

          // Get all the existing member data
          this.channel.getMembers().then((members) => {
            console.log('MEMBERS: ', members)
            for (let memberId of members) {
              if (memberId != uid) {
                this.updateUserAttrs(memberId)
              }
            }
          })

          // Join/Leave and Message events
          this.channel.on('MemberJoined', memberId => {
            this.updateUserAttrs(memberId)
          })

          this.channel.on('MemberLeft', memberId => {
            this.removeUser(memberId)
          })

          this.channel.on('ChannelMessage', ({text}, senderId) => {
            this.handleMessage({ uid: senderId, ...JSON.parse(text) })
          });

          resolve();
        }).catch(error => {
          console.log("Failure to join channel: " + error);
        });
      }).catch(err => {
        console.log('AgoraRTM client login failure', err);
      });
    });
  }
}

/* message types

{
  type: 'user',
  uid: 'afwhuuwaiaw83f89j3',
  username: 'Arjun Patrawala',
  x: 50,
  y: 90
}

*/

export default World;
