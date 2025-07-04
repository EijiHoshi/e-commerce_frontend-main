import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatAdminPage } from './chat-admin.page';

@NgModule({
    declarations: [ChatAdminPage],
    imports: [CommonModule, FormsModule],
    exports: [ChatAdminPage]
})
export class ChatAdminPageModule { } 