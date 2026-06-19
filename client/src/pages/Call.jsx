

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import {
  createPeerConnection,
} from "../services/webrtc";

function Call() {

  const localVideoRef = useRef(null);
  const peerRef = useRef(null);
  const navigate = useNavigate();
  const remoteVideoRef = useRef(null);

      const endCall = () => {

      const targetSocketId =
        localStorage.getItem(
          "targetSocketId"
        );

      socket.emit(
        "end-call",
        {
          to:
            targetSocketId,
        }
      );

      if (
        localVideoRef.current
          ?.srcObject
      ) {

        localVideoRef.current
          .srcObject
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

      }

      navigate( "/dashboard" );

    };

  useEffect(() => {
    console.log("CALL PAGE OPENED");

    const startMedia = async () => {
      let stream = null;
      try {

        console.log(
          "Secure:",
          window.isSecureContext
        );

        console.log(
          "MediaDevices:",
          navigator.mediaDevices
        );

        if ( !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log("Camera API not available");
          alert("Camera API not available...")
        }
        else{
          console.log("Camera API available");
          alert("Camera API AVAILABLE...")
        }

        if ( navigator.mediaDevices &&  navigator.mediaDevices.getUserMedia ) {
          stream =
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
        }

        if (  stream && localVideoRef.current ) {
          localVideoRef.current.srcObject =
            stream;
        }

        peerRef.current =
          createPeerConnection();
        
        peerRef.current.ontrack = (event) => { 
          console.log( "REMOTE STREAM RECEIVED" );
          console.log("EVENT = ",event);

          if (
            remoteVideoRef.current
          ) {

            remoteVideoRef.current.srcObject =
              event.streams[0];

          }
        };

        if (stream) {

          stream.getTracks().forEach(
            (track) => {

              console.log(
                "ADDING TRACK:",
                track.kind
              );

              peerRef.current.addTrack(
                track,
                stream
              );

            }
          );

        }

        peerRef.current.onicecandidate =
          (event) => {

            if (event.candidate) {

              const targetSocketId =
                localStorage.getItem(
                  "targetSocketId"
                );

              console.log(
                "ICE SENT"
              );

              socket.emit(
                "ice-candidate",
                {
                  candidate:
                    event.candidate,
                  to:
                    targetSocketId,
                }
              );
            }
          };

        socket.on(
          "ice-candidate",
          async (data) => {

            try {

              await peerRef.current
                .addIceCandidate(
                  data.candidate
                );

              console.log(
                "ICE RECEIVED"
              );

            } catch (err) {

              console.log(err);

            }
          }
        );

        console.log("REGISTERING OFFER LISTENER" );
        socket.on(
          "offer",
          async (data) => {

            alert("OFFER EVENT HIT");
            console.log("OFFER EVENT HIT");
            console.log( "Offer Received" );
            alert("Offer Received");

            await peerRef.current
            .setRemoteDescription(
              new RTCSessionDescription(
                data.offer
              )
            );

            alert("Creating answer.......ANSWER")
            const answer =
              await peerRef.current
                .createAnswer();
            alert("ANSWER CREATED");

            await peerRef.current
              .setLocalDescription(
                answer
              );

            socket.emit(
              "answer",
              {
                answer,
                to: data.from,
              }
            );

            console.log(
              "Answer Sent"
            );
            alert("Answer sent");
          }
        );

        socket.on(
          "answer",
          async (data) => {

            console.log(
              "Answer Received"
            );
            alert("Answer Received");

            await peerRef.current
            .setRemoteDescription(
              new RTCSessionDescription(
                data.answer
              )
            );
          }
        );

        socket.on(
          "call-ended",
          () => {

            alert(
              "Call Ended"
            );

            if (
              localVideoRef.current
                ?.srcObject
            ) {

              localVideoRef
                .current
                .srcObject
                .getTracks()
                .forEach(
                  (track) =>
                    track.stop()
                );

            }

            navigate(
              "/dashboard"
            );

          }
        );
        const shouldCreateOffer =
          localStorage.getItem(
            "createOffer"
          );

        if ( shouldCreateOffer === "true" && !peerRef.current.localDescription ) {

          localStorage.removeItem(
            "createOffer"
          );

          const targetSocketId =
            localStorage.getItem(
              "targetSocketId"
            );

          console.log(
            "TARGET SOCKET:",
            targetSocketId
          );

          console.log(
            "Creating Offer"
          );
          alert("Creating offer");

          console.log("CREATE OFFER START");
          const offer =
            await peerRef.current.createOffer();

          await peerRef.current.setLocalDescription( offer );
          console.log("LOCAL DESCRIPTION SET");

          socket.emit(
            "offer",
            {
              offer,
              to:
                targetSocketId,
            }
          );

          console.log(
            "Offer Sent"
          );
        }

      } catch (error) {

        console.log(error);

        alert(
          error.name +
          "\n" +
          error.message
        );

      }
    };

    startMedia();

    return () => {

      socket.off("offer");
      socket.off("answer");
      socket.off(
        "ice-candidate"
      );

    };

  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>
        Call Screen
      </h1>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "500px",
          border:
            "2px solid black",
        }}
      />

      <h2>Remote Video</h2>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "500px",
          border: "2px solid red",
        }}
      />

      <br />
      <br />

      <button  onClick={ endCall} > End Call </button>
    </div>
  );
}

export default Call;

