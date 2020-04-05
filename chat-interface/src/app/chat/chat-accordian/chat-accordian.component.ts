import { Component, OnInit, Input, SimpleChanges,Pipe,PipeTransform } from '@angular/core';


@Component({
  selector: 'app-chat-accordian',
  templateUrl: './chat-accordian.component.html',
  styleUrls: ['./chat-accordian.component.scss']
})


export class ChatAccordianComponent implements OnInit {
  @Input() items:Accordian[];

  show:boolean = false;

  constructor() { }

  show_text(e){
    let item:HTMLElement = e.target as HTMLElement;
    if (item.nodeName == "BUTTON"){
      item = item.children[0] as HTMLElement;
    }
    let text:HTMLElement = item.parentElement.nextSibling.lastChild as HTMLElement;
    let accordian:HTMLElement = item.parentElement.parentElement as HTMLElement;

    if (item.innerHTML == "keyboard_arrow_down"){
      item.innerHTML = "keyboard_arrow_up";
      text.classList.add("text-visible");
      accordian.classList.add("active");
      this.scrollOpen(accordian);
    } else{
      item.innerHTML = "keyboard_arrow_down";
      text.classList.remove("text-visible");
      accordian.classList.remove("active");
    }
    
  }

  scrollOpen(item:HTMLElement){
    this.animate(item, "scrollTop", "", 0, item["offsetTop"], 1000, true);
    

  }

  animate(elem, style, unit, from, to, time, prop) {
    if (!elem) {
        return;
    }
    var start = new Date().getTime(),
        timer = setInterval(function () {
            var step = Math.min(1, (new Date().getTime() - start) / time);
            if (prop) {
                elem[style] = (from + step * (to - from))+unit;
            } else {
                elem.style[style] = (from + step * (to - from))+unit;
            }
            if (step === 1) {
                clearInterval(timer);
            }
        }, 25);
    if (prop) {
          elem[style] = from+unit;
    } else {
          elem.style[style] = from+unit;
    }
}

  

  ngOnInit(): void {
    let self = this;
    this.items.forEach(function(value, i){
      let icon = "assets/icons/providers.svg";



      if (value.title.toLowerCase().includes("symptoms")){
        icon = "assets/icons/human.svg";
      } else if (value.title.toLowerCase().includes("loved")){
        icon = "assets/icons/loved.svg";
      } else if (value.title.toLowerCase().includes("browse")){
        icon = "assets/icons/search.svg";
      } else if (value.title.toLowerCase().includes("others")){
        icon = "assets/icons/people.svg";
      } else if (value.title.toLowerCase().includes("informed")){
        icon = "assets/icons/news.svg";
      } else if (value.title.toLowerCase().includes("heart")){
        icon = "assets/icons/heart.svg";
      } else if (value.title.toLowerCase().includes("sick")){
        icon = "assets/icons/thermometer.svg";
      } else if (value.title.toLowerCase().includes("heal")){
        icon = "assets/icons/healing.svg";
      } else if (value.title.toLowerCase().includes("inside")){
        icon = "assets/icons/house.svg";
      } else if (value.title.toLowerCase().includes("reduce")){
        icon = "assets/icons/warning.svg";
      } else if (value.title.toLowerCase().includes("home")){
        icon = "assets/icons/house.svg";
      } else if (value.title.toLowerCase().includes("call")){
        icon = "assets/icons/call.svg";
      }


      self.items[i].icon = icon;
    });

  }



}

export class Accordian {
  constructor(  public title:string, 
                public subtitle: string, 
                public text: string, 
                public icon: string, 
                ) {}
}
