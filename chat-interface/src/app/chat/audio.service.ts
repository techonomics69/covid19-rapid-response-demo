/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject, Observer } from 'rxjs';
import { isNullOrUndefined } from 'util';

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}

@Injectable()
export class AudioService {

  private stream;
  private recorder;
  private interval;
  private startTime;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  public _onSpeakStart;
  public _onSpeakEnd;

  constructor() {

  }

  setOnSpeakListeners(start, stop){
      this._onSpeakStart = start;
      this._onSpeakEnd = stop;
  }
  
  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }


  startRecording() {
    console.log("start recording called");
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }
    
    var constraints = {
      audio: {
          sampleRate: 48000,
          channelCount: 1,
          volume: 1.0
      },
      video: false
  }


    this._recordingTime.next('00:00');
    if (navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia(constraints).then(s => {
        this.detectSilence(s, this._onSpeakEnd, this._onSpeakStart);
        this.stream = s;
        this.record();
  
      }).catch(error => {
        console.log(error);
        this._recordingFailed.next();
      });


    } else{
      console.log("getUserMedia not supported");
    }
    

  }

  abortRecording() {
    this.stopMedia();
  }

  private record() {

    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      sampleRate: 48000,
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1
    });

    this.recorder.record();
    this.startTime = moment();
    this.interval = setInterval(
      () => {
        const currentTime = moment();
        const diffTime = moment.duration(currentTime.diff(this.startTime));
        const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
        this._recordingTime.next(time);
      },
      1000
    );
  }

  private toString(value) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        if (this.startTime) {
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this.stopMedia();
          this._recorded.next({ blob: blob, title: mp3Name });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next();
      });
    }
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

   detectSilence(
    stream,
    onSoundEnd ,
    onSoundStart,
    silence_delay = 1000,
    min_decibels = -80
    ) {


  var AudioContext = window.AudioContext || (window as any).webkitAudioContext || false; 
  
    if (!AudioContext) {
      alert("Sorry, but the Web Audio API is not supported by your browser.");
    }



    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const streamNode = ctx.createMediaStreamSource(stream);
    streamNode.connect(analyser);
    analyser.minDecibels = min_decibels;

    console.log("detect silence fired");
  
    const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
    let silence_start = performance.now();
    let triggered = true; // trigger only once per silence event
    let speaking_start = false;
  
    function loop(time) {
      requestAnimationFrame(loop); // we'll loop every 60th of a second to check
      analyser.getByteFrequencyData(data); // get current data
      if (data.some(v => v)) { // if there is data above the given db limit
        speaking_start = true;
        if(triggered){
          triggered = false;
          
          onSoundStart();
          
          }
        silence_start = time; // set it to now
      }
      if ((!triggered && time - silence_start > silence_delay) && (speaking_start)) {
        onSoundEnd();
        triggered = true;
      }
    }
    loop(50);
  }



 onSilence() {
  console.log('silence');
}
 onSpeak() {
  console.log('speaking');
}

}


