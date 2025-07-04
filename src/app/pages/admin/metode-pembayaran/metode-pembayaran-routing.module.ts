import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetodePembayaranPage } from './metode-pembayaran.page';

const routes: Routes = [
    {
        path: '',
        component: MetodePembayaranPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MetodePembayaranRoutingModule { } 