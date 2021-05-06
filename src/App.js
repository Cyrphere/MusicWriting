import logo from "./logo.svg";
import { readFileSync } from "fs";
import WavDecoder from "wav-decoder";
import ml5 from "ml5";
import RecorderJS from "recorderjs";
import Pitchfinder from "pitchfinder";

import { useEffect } from "react";

import "./App.css";

function App() {
  // see below for optional configuration parameters.

  function getAudioStream() {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia =
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(
            new Error("getUserMedia is not implemented in this browser")
          );
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    const params = { audio: true, video: false };

    return navigator.mediaDevices.getUserMedia(params);
  }

  const detectPitch = Pitchfinder.AMDF();

  async function analyzeBlob(blob) {
    const buf = await blob.arrayBuffer();
    const ac = new AudioContext();
    console.log(buf);
    const myAudioBuffer = await ac.decodeAudioData(buf);
    console.log(myAudioBuffer);

    const pitch = detectPitch(myAudioBuffer); // null if pitch cannot be identified
    console.log("pitch", pitch);

    // fileReader.readAsArrayBuffer(blob);
  }

  useEffect(() => {
    (async () => {
      const audioStream = await getAudioStream();
      // let recorder = new MediaRecorder(audioStream);
      // recorder.start(1000);

      // let data = [];
      // recorder.ondataavailable = async (event) => {
      //   data.push(event.data);
      //   console.log("DATAAAAA", event.data);
      //   await analyzeBlob(event.data);
      // };

      console.log(audioStream);
      const audioContext = new AudioContext();
      const pitch = ml5.pitchDetection(
        "/model",
        audioContext,
        audioStream,
        modelLoaded
      );

      // When the model is loaded
      function modelLoaded() {
        console.log("Model Loaded!");
      }
      setInterval(() => {
        console.log("HI");
        pitch.getPitch(function (err, frequency) {
          console.log(frequency);
        });
      }, 1000);

      console.log("Hi");
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to sldfkjasdlfjlasdkj.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
