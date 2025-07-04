import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatPage implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  sending = false;
  userId: number = 0;
  chatId: number = 0;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.messages = [];
    this.chatId = 0;
    this.userId = 0;
    this.getProfileAndChat();
  }

  getProfileAndChat() {
    this.api.getProfile().subscribe(profile => {
      this.userId = profile.id;
      this.api.getChat().subscribe(chat => {
        if (!chat || !chat.id) {
          this.chatId = 0;
          this.messages = [];
          alert('Gagal memuat chat. Silakan refresh atau hubungi admin.');
          return;
        }
        this.chatId = chat.id;
        this.messages = chat.messages || [];
        this.scrollToBottom();
      }, err => {
        alert('Gagal memuat chat. Silakan refresh atau hubungi admin.');
      });
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.chatId) return;
    this.sending = true;
    this.api.sendMessage(this.chatId, this.newMessage).subscribe(msg => {
      this.messages.push(msg);
      this.newMessage = '';
      this.sending = false;
      this.scrollToBottom();
    }, () => { this.sending = false; });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
