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

import { Component, OnInit } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import { AudioService } from '../audio.service' 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent implements OnInit {

  subscription;
  messages_present: boolean = false;
  formValue: string;
  isRecording = false;
  recordedTime;
  blobUrl;
  blob;
  audio_playing:boolean = false;
  isSpeaking = false;

  constructor(public chat: ChatService, public audio: AudioService, private sanitizer: DomSanitizer) { 
    this.audio.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audio.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.audio.getRecordedBlob().subscribe((data) => {
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.blob = data.blob;
      console.log("getrecordedblob fired");
      this.chat.converseAudio(this.blob);

      const tempmsg = new Message("text", "", 'temp', "");
      tempmsg.display = true;
      this.hideQuick();
      this.chat.update(tempmsg);

    });
  }

  ngOnInit(): void {
    this.audio.setOnSpeakListeners(this.speekingStarts, this.speekingStops);
    this.hideMicOniOS();

  }

  detectiOS():boolean{
      return /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);
  }

  hideMicOniOS():void{
    if (this.detectiOS()){
      let mic:HTMLElement = document.querySelector(".audio-record") as HTMLElement;
      mic.style.display= "none";
    }
    
  }

  sendMessage() {
    if (typeof this.formValue !== "undefined" && this.formValue !== ""){
      this.hideQuick();
      this.chat.converseText(this.formValue);
      this.formValue = '';
      this.messages_present = true;
      
    }

    
  }

  hideQuick(){
    let quick:NodeListOf<Element> = document.querySelectorAll(".quick-replies") as NodeListOf<Element>;

    quick.forEach(function(el){
      let el_prop:HTMLElement = el as HTMLElement;
      el_prop.style.display = "none";
    });
  }

  toggleSpeech(e) {
    let icon = e.target;
    let audio = e.target.parentElement.previousSibling.previousSibling;
    if (audio.paused){
      if (this.audio_playing){
        return;
      }
      audio.play();
      icon.src = "assets/speaker-pulse.svg";
      this.audio_playing = true; 
    } else {
      audio.pause();
      icon.src = "assets/speaker.svg";
      this.audio_playing = false;
    }
  }

  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audio.startRecording();
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audio.abortRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audio.stopRecording();
      this.isRecording = false;
    }
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  toggleRecording(e){
    console.log("toggle recording fired")
    let btn = e.target.parentElement;
    let input:HTMLElement = document.querySelector(".chat-entry") as HTMLElement;
    if (this.isRecording){
      console.log("stop recording")
      this.stopRecording();
      btn.classList.remove("mic-active");
      this.hideRecording()
      input.dataset.recording_stopped = "true";

    } else{
      console.log("start recording")
      this.startRecording();
      btn.classList.add("mic-active");
      this.showRecording();
      input.dataset.recording_stopped = "false";
    }
  }

  speekingStarts(){
    let input:HTMLElement = document.querySelector(".chat-entry") as HTMLElement;
    if (input.dataset.recording_stopped == "true"){
      return;
    }


    input.classList.add("chat-entry-talk");
    input.dataset.speaking = "true";
    console.log("speaking started");
  }

  speekingStops(){
    let input:HTMLElement = document.querySelector(".chat-entry") as HTMLElement;
    input.classList.remove("chat-entry-talk");
    input.dataset.speaking = "false";
    console.log("speaking stopped");

    setTimeout(function(){ 
        let input:HTMLElement = document.querySelector(".chat-entry") as HTMLElement;
        if (input.dataset.speaking == "false"){
          console.log("ok, we should end this audio session");
          let btn:HTMLElement = document.querySelector(".audio-record") as HTMLElement;
          if (btn.classList.contains("mic-active")){
            btn.click();
            btn.classList.remove("mic-active");
          }
        }
     }, 1500);
  }

  showRecording(){
    let input = document.querySelector(".chat-entry");
    input.classList.add("chat-entry-wait");
    input["disabled"] = true;
  }

  hideRecording(){
    let input = document.querySelector(".chat-entry");
    input.classList.remove("chat-entry-wait");
    input["disabled"] = false;
  }

  ngAfterViewChecked(){
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }

}
