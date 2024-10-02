import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:"dashboard",loadComponent:()=>import('./components/dashboard/dashboard.component').then((m)=>m.DashboardComponent)},
    {path:"add",loadComponent:()=>import('./components/add/add.component').then((m)=>m.AddComponent)},
    {path:"",redirectTo:"/dashboard",pathMatch:'full'}
];
