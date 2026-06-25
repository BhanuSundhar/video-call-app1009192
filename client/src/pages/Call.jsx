

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import { createPeerConnection } from "../services/webrtc";

function Call() {
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);
  const offerHandledRef = useRef(false);
  const answerHandledRef = useRef(false);

  const [micOn, setMicOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOn, setVideoOn] = useState(true);

  const stopStreams = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const closePeerConnection = () => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }
  };

  const cleanupCall = () => {
    offerHandledRef.current = false;
    answerHandledRef.current = false;
    pendingIceCandidatesRef.current = [];

    stopStreams();
    closePeerConnection();

    localStorage.removeItem("createOffer");
    localStorage.removeItem("targetSocketId");
  };

  const toggleMic = () => {
    console.log("MIC CLICKED");

    if (!localStreamRef.current) return;

    const next = !micOn;

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = next;
      console.log("AUDIO TRACK ENABLED:", track.enabled);
    });

    setMicOn(next);
  };

  const toggleSpeaker = () => {
    if (!remoteVideoRef.current) return;

    const next = !speakerOn;
    remoteVideoRef.current.muted = !next;
    remoteVideoRef.current.volume = next ? 1 : 0;
    setSpeakerOn(next);
  };

  const toggleVideo = () => {
    console.log("VIDEO CLICKED");

    if (!localStreamRef.current) return;

    const next = !videoOn;

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = next;
      console.log("VIDEO TRACK ENABLED:", track.enabled);
    });

    setVideoOn(next);
  };

  const endCall = () => {
    const targetSocketId = localStorage.getItem("targetSocketId");

    if (targetSocketId) {
      socket.emit("end-call", {
        to: targetSocketId,
      });
    }

    cleanupCall();
    navigate("/dashboard");
  };

  useEffect(() => {
    let mounted = true;

    const handleIceCandidate = async (data) => {
      try {
        console.log(
          "ICE RECEIVED"
        );
        if (!peerRef.current || !data?.candidate) return;

        if (!peerRef.current.remoteDescription) {
          pendingIceCandidatesRef.current.push(data.candidate);
          return;
        }

        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error(error);
      }
    };

    const handleOffer = async (data) => {
      try {
        if (!peerRef.current) return;
        if (offerHandledRef.current) return;
        if (peerRef.current.signalingState !== "stable") return;

        offerHandledRef.current = true;
        localStorage.setItem("targetSocketId", data.from);

        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        socket.emit("answer", {
          answer,
          to: data.from,
        });

        for (const candidate of pendingIceCandidatesRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (e) {
            console.log(e);
          }
        }

        pendingIceCandidatesRef.current = [];
      } catch (error) {
        console.error(error);
      }
    };

    const handleAnswer = async (data) => {
      try {
        console.log(
          "ANSWER RECEIVED"
        );

        console.log(
          peerRef.current.signalingState
        );
        if (!peerRef.current) return;
        if (answerHandledRef.current) return;
        if (peerRef.current.signalingState !== "have-local-offer") return;

        answerHandledRef.current = true;

        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        for (const candidate of pendingIceCandidatesRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (e) {
            console.log(e);
          }
        }

        pendingIceCandidatesRef.current = [];
      } catch (error) {
        console.error(error);
      }
    };

    const handleCallEnded = () => {
      cleanupCall();
      navigate("/dashboard");
    };

    const startMedia = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not available");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        // default mic OFF
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        setMicOn(false);
        setSpeakerOn(false);
        setVideoOn(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        peerRef.current = createPeerConnection();
        offerHandledRef.current = false;
        answerHandledRef.current = false;
        pendingIceCandidatesRef.current = [];

        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        peerRef.current.onicecandidate = (event) => {
          if (!event.candidate) return;

          const targetSocketId = localStorage.getItem("targetSocketId");
          if (targetSocketId) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: targetSocketId,
            });
          }
        };

        peerRef.current.ontrack = (event) => {
          const remoteStream = event.streams?.[0];
          if (!remoteStream || !remoteVideoRef.current) return;
          remoteVideoRef.current.srcObject = remoteStream;
        };

        socket.on("ice-candidate", handleIceCandidate);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("call-ended", handleCallEnded);

        const shouldCreateOffer = localStorage.getItem("createOffer");
        if (shouldCreateOffer === "true") {
          localStorage.removeItem("createOffer");

          const targetSocketId = localStorage.getItem("targetSocketId");
          if (!targetSocketId) {
            throw new Error("Target socket not found");
          }

          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);

          socket.emit("offer", {
            offer,
            to: targetSocketId,
          });
        }
      } catch (error) {
        console.error(error);
        alert(error.message || "Call setup failed");
      }
    };

    startMedia();

    return () => {
      mounted = false;
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("call-ended", handleCallEnded);
      cleanupCall();
    };
  }, [navigate]);

  return (
    <div className="call-layout">
      <div className="call-stage glass">
        <div className="call-header">
          <div className="call-title">
            <h1>Live Call</h1>
            <p>Secure peer-to-peer video room</p>
          </div>

          <div className="pill">
            <span className="pill-dot" />
            Connected live
          </div>
        </div>

        <div className="call-grid">
          <div className="video-card">
            <div className="video-head">Your video</div>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="video-box"
            />
          </div>

          <div className="video-card">
            <div className="video-head">Remote video</div>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted = {!speakerOn}
              className = "video-box"
            />
          </div>
        </div>

        <div className="call-controls">
          <button className="control-btn" onClick={toggleVideo}>
            {videoOn ? "📷 Video ON" : "🚫 Video OFF"}
          </button>

          <button className="control-btn" onClick={toggleMic}>
            {micOn ? "🎤 Mic ON" : "🎤 Mic OFF"}
          </button>

          <button className="control-btn" onClick={toggleSpeaker}>
            {speakerOn ? "🔊 Speaker ON" : "🔇 Speaker OFF"}
          </button>

          <button className="control-btn danger" onClick={endCall}>
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default Call;

