/**
 * webrtcに関するクラスを実装
 */
var Webrtc = Class.extend({
  /**
   * 初期化
   * @param {Object} option {
   *   videoElementId: "",
   *   iceCandidateCallback: function() {}
   * }
   */
  init: function(option) {
    this.option = option;
    this.peer = null;
    this.localStream = null;
    this.isStartVideo = false;
  },

  /**
   * コネクションをはる
   * @return {Boolean} true: RTCPeerConnectionが生成済み, false: 生成できなかった
   */
  connect: function() {
    if (this.peer) {
      return true;
    }

    if (!this.localStream) {
      return false;
    }

    if (!this.option.videoElementId) {
      return false;
    }

    this.peer = this.createPeer();
    this.peer.addStream(this.localStream);
    var iceCandidateCallback = this.option.iceCandidateCallback;
    this.peer.onicecandidate = function(event) {
      iceCandidateCallback && iceCandidateCallback(event.candidate);
    };
    var videoElementId = this.option.videoElementId;
    this.peer.onaddstream = function(event) {
      var video = document.getElementById(videoElementId);
      video.src = window.webkitURL.createObjectURL(event.stream);
    };
    return true;
  },

  /**
   * Peerを生成
   * @return {Object} RTCPeerConnection
   */
  createPeer: function() {
    return (new webkitRTCPeerConnection({
      "iceServers": [{"url": "stun:stun.l.google.com:19302"}]
    }));
  },

  /**
   * videoにカメラを接続
   */
  startVideo: function() {
    var video;
    if (this.option && this.option.videoElementId) {
      video = document.getElementById(this.option.videoElementId);
    } else {
      console.log("no video!!");
    }
    navigator.webkitGetUserMedia({video: true, audio: true},
      (function(stream) {
        video.src = window.URL.createObjectURL(stream);
        this.localStream = stream;
        this.isStartVideo = true;
      }.bind(this)),
      (function(err) {
        this.isStartVideo = false;
        console.log(err);
      }.bind(this))
    );
  },

  /**
   * SDPを生成する
   * @param {String} sdpType: offer or answer
   * @param {Function} callback
   */
  createSdp: function(sdpType, callback) {
    var createSdpCallback = function(sdp) {
      this.peer.setLocalDescription(sdp,
        function() {
          callback(sdp);
        },
        function(err) {
          console.log(err);
        }
      );
    }.bind(this);
    
    if (sdpType === "offer") {
      this.peer.createOffer(createSdpCallback);
    } else if (sdpType === "answer") {
      this.peer.createAnswer(createSdpCallback);
    }
  },

  /**
   * SDPを受け取る
   * @param {Object} sdp
   */
  receiveSdp: function(sdp) {
    var remoteSdp = new RTCSessionDescription(sdp);
    this.peer.setRemoteDescription(remoteSdp,
      function() {
        if (remoteSdp.type === "offer") {
          console.log("receive offer");
        }
        if (remoteSdp.type === "answer") {
          console.log("receive answer");
        }
      },
      function(err) {
        console.log(err);
      }
    );
  },

  /**
   * 経路情報を受け取る
   * @param {Object} candidate
   */
  receiveCandidate: function(candidate) {
    if (candidate) {
      var candidate = new RTCIceCandidate(candidate);
      this.peer.addIceCandidate(candidate);
    } else {
      console.log("finish candidate!!");
    }
  }
});
