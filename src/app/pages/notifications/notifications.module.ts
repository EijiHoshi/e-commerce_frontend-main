import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationsPage } from './notifications.page';
import { TimeAgoPipe } from './notifications.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        NotificationsPage,
        TimeAgoPipe
    ]
})
export class NotificationsPageModule { } 