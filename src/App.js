import logo from "./logo.svg";
import "./App.css";
import ml5 from "ml5";
import { useEffect, useState } from "react";

function App() {
  function freqtoNote(frequency) {
    var noteStrings = [
      "C",
      "C#",
      "D",
      "Eb",
      "E",
      "F",
      "F#",
      "G",
      "Ab",
      "A",
      "Bb",
      "B",
    ];
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return (
      noteStrings[(Math.round(noteNum) + 69) % 12] +
      Math.floor((Math.round(noteNum) + 57) / 12)
    );
  }
  function playSound() {
    const audio = new Audio("click.mp3");
    audio.play();
  }
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
  const [currentNote, setcurrentNote] = useState("");
  const [tempo, setTempo] = useState(60);
  const [effectiveTempo, setEffectiveTempo] = useState(60);

  useEffect(() => {
    let interval;
    let interval2;
    (async () => {
      const audioStream = await getAudioStream();
      const audioContext = new AudioContext();
      const pitch = ml5.pitchDetection(
        "model/",
        audioContext,
        audioStream,
        modelLoaded
      );

      // When the model is loaded
      function modelLoaded() {
        console.log("Model Loaded!");
      }

      interval = setInterval(() => {
        pitch.getPitch(function (err, frequency) {
          console.log(freqtoNote(frequency));
          setcurrentNote(freqtoNote(frequency));
        });
      }, 60000 / effectiveTempo);

      interval2 = setInterval(() => {
        playSound();
      }, 60000 / tempo);
    })();

    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
  }, [tempo]);

  return (
    <>
      <div className="App">
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
          rel="stylesheet"
        ></link>
        <header className="App-header">
          <text className="title">Music Writing Machine</text>
          <img src="music.jpeg" className="MusicLogo" alt="musiclogo" />
          <label for="tempo">Tempo</label>
          <input type="text" id="tempo" name="tempo"></input>
          <button
            onClick={() => {
              setTempo(parseInt(document.getElementById("tempo").value) || 60);
            }}
          >
            Submit
          </button>
          <p>{currentNote}</p>
        </header>
      </div>
      <div className="Options">
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
          rel="stylesheet"
        ></link>
        <button
          onClick={() => {
            setEffectiveTempo(
              parseInt(document.getElementById("tempo").value) || 60
            );
          }}
        >
          Full
        </button>
        <button
          onClick={() => {
            setEffectiveTempo(
              parseInt(document.getElementById("tempo").value) * 2 || 120
            );
          }}
        >
          Half
        </button>
        <button
          onClick={() => {
            setEffectiveTempo(
              parseInt(document.getElementById("tempo").value) * 4 || 240
            );
          }}
        >
          Quarter
        </button>
        <button
          onClick={() => {
            setEffectiveTempo(
              parseInt(document.getElementById("tempo").value) * 8 || 480
            );
          }}
        >
          Eighth
        </button>
      </div>
    </>
  );
}

export default App;
