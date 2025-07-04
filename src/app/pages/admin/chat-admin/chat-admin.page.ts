import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { HeaderComponent } from '../header.component';
import { SidebarComponent } from '../sidebar.component';

@Component({
    selector: 'app-chat-admin',
    templateUrl: './chat-admin.page.html',
    styleUrls: ['./chat-admin.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule, HeaderComponent, SidebarComponent]
})
export class ChatAdminPage implements OnInit {
    chats: any[] = [];
    selectedChat: any = null;
    messages: any[] = [];
    newMessage: string = '';
    loadingChats = false;
    loadingMessages = false;
    sending = false;

    // Tambahan untuk fitur UI
    searchTerm: string = '';
    unreadCount: number = 0;

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.getChats();
    }

    getChats() {
        this.loadingChats = true;
        this.api.getAdminChats().subscribe({
            next: (res) => {
                this.chats = res;
                this.updateUnreadCount();
                this.loadingChats = false;
            },
            error: () => { this.loadingChats = false; }
        });
    }

    selectChat(chat: any) {
        this.selectedChat = chat;
        this.getMessages(chat.id);
    }

    getMessages(chatId: number) {
        this.loadingMessages = true;
        this.api.getAdminMessages(chatId).subscribe({
            next: (res) => {
                this.messages = res;
                this.loadingMessages = false;
            },
            error: () => { this.loadingMessages = false; }
        });
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.selectedChat) return;
        this.sending = true;
        this.api.sendAdminMessage(this.selectedChat.id, this.newMessage).subscribe({
            next: (msg) => {
                this.messages.push(msg);
                this.newMessage = '';
                this.sending = false;
            },
            error: () => { this.sending = false; }
        });
    }

    // --- Tambahan untuk UI modern ---
    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    onSearchChange() {
        // Filter chats by searchTerm (sederhana, bisa diimprove)
        // Misal: this.chats = this.chatsAll.filter(...)
        // Untuk demo, tidak diimplementasi penuh
    }

    updateUnreadCount() {
        this.unreadCount = this.chats.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
    }
} 