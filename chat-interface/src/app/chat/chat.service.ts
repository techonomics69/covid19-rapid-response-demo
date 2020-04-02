// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';


export class Message {
  constructor(  public queryMethod:string, 
                public content: string, 
                public sentBy: string, 
                public responseID: string, 
                public audio?:any, 
                public autoplay?:string, 
                public temporary?:boolean,
                public quick?:any,
                public rich?:any,
                public display?:boolean,
                public accordian?:boolean,
                public haslist?:boolean) {}
}

export class DFEvent {
  constructor(  public title:string, 
                public event: string, 
                ) {}
}

export interface QueryResponse{
  text:string;
  audio:string;
  original_reqeust:string;
  response_id:string;
  messages:any
  messages_json:string[];

}

@Injectable()
export class ChatService {
  session_id:Number;

  conversation = new BehaviorSubject<Message[]>([]);

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.session_id = IDGenerator();
  }

  // Sends and receives messages via DialogFlow
  converseText(msg: string) {
    const userMessage = new Message("text", msg, 'user', "");
    this.update(userMessage);

    let apiURL = environment.apihost + "/query/text";
    let formData = new FormData();
    formData.append('q', msg);
    formData.append('session', this.session_id.toString());

    return this.http.post<QueryResponse>(apiURL, formData)
      .subscribe(res => {
        this.handleResponse(res);
      });

  }

  converseEvent(event: DFEvent) {
    const userMessage = new Message("text", event.title, 'user', "");
    this.update(userMessage);

    let apiURL = environment.apihost + "/query/event";
    let formData = new FormData();
    formData.append('event', event.event);
    formData.append('session', this.session_id.toString());

    return this.http.post<QueryResponse>(apiURL, formData)
      .subscribe(res => {
        this.handleResponse(res);
      });
  }

  converseAudio(audio: string) {

    const formData = new FormData();
    formData.append('file', audio);
    formData.append('session', this.session_id.toString());
    let apiURL = environment.apihost + "/query/audio";

    return this.http.post<QueryResponse>(apiURL, formData)
      .subscribe(res => {
        this.handleResponse(res);
      });

  }

  handleResponse(res) {
    let payload = this.getRichMessages(res.messages_json);

    let quick_replies = [];
    let audiourl: any = "";
    if (res.audio != null) {
      audiourl = this.sanitizer.bypassSecurityTrustUrl("data:audio/wav;base64," + res.audio)
    }

    let botMessage = new Message("text", "", "bot", res.response_id);
    botMessage.audio = audiourl;
    botMessage.quick = quick_replies;
    botMessage.display = true;
    botMessage.accordian = false;
    botMessage.haslist = false;

    // if these are null, we need to use the rich message data. 
    if (typeof payload != "undefined") {
      let resp = this.extractContentFromRichMessages(payload);
      quick_replies = this.extractQuickFromRichMessages(payload);
      botMessage.content = " ";
      botMessage.rich = resp;
      botMessage.quick = quick_replies;

      if (Array.isArray(resp)) {
        botMessage.display = false;
        botMessage.accordian = true;
      }
      if (resp.text && resp.text[0] && resp.text[0].title){
        botMessage.haslist = true;
        botMessage.sentBy = "list";
      }

    } else {
      botMessage.content = res.text;
    }
    if (botMessage.content.length == 0) {
      botMessage.display = false;

    }
    this.update(botMessage);
  }

  getRichMessages(messages_json) {
    let response: any;
    let textNode = [];

    messages_json.forEach(function (value) {
      let item = JSON.parse(value);

      if (item.hasOwnProperty("text")) {
        textNode = [{ "title": item.text.text[0], "type": "description" }];
        return;
      }

      if (item.hasOwnProperty("payload")) {
        response = item.payload
        return;
      }

    });

    if (textNode.length > 0 && (typeof response != "undefined")) {
      response.richContent.unshift(textNode);
    }

    return response;
  }

  // Adds message to source
  update(msg: Message) {
    this.conversation.next([msg]);
  }


  extractContentFromRichMessages(payload) {

    let resp: any

    if (payload.richContent) {
      payload.richContent.forEach(function (value) {
        if (value[0].type == "description") {
          resp = value[0];
          if (!resp.text) {
            resp.text = [];
          }
          value.forEach(function (subvalue) {
            if (subvalue.type == "list") {

              let list_item = { "title": subvalue.title, "event": subvalue.event.name };
              resp.text.push(list_item);
            }

          });
          return;
        }

        if (value[0].type == "info") {
          resp = value[0];
          return;
        }

        if (typeof resp == "undefined") {
          resp = [];
        }

        if (value[0].type == "accordion") {

          value.forEach(function (subvalue) {
            resp.push(subvalue);
          });
          return;
        }
      });
    }
    return resp;
  }

  extractQuickFromRichMessages(payload) {
    let resp = [];
    if (payload.richContent) {
      if (payload.richContent.length == 2) {
        payload.richContent.forEach(function (value) {
          if (value[0].type == "chips") {
            value[0].options.forEach(function (subvalue) {
              resp.push(subvalue.text)
            });
          }
        });
      }
      if (payload.richContent.length == 1) {
        payload.richContent[0].forEach(function (value) {
          if (value.type == "chips") {
            value.options.forEach(function (subvalue) {
              resp.push(subvalue.text)
            });
          }
        });
      }
    }
    return resp;
  }
}  

function IDGenerator():Number {
  return Date.now() + Math.random();
}