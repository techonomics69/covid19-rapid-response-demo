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

    if (item.innerHTML == "keyboard_arrow_up"){
      item.innerHTML = "keyboard_arrow_down";
      text.style.display = "block";
    } else{
      item.innerHTML = "keyboard_arrow_up";
      text.style.display = "none";
    }
    
  }
  

  ngOnInit(): void {
  }



}

export class Accordian {
  constructor(  public title:string, 
                public subtitle: string, 
                public text: string, 
                ) {}
}
