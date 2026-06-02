import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { FeedComponent } from './features/feed/feed';
import { ProfileComponent } from './features/profile/profile';
import { ThreadComponent } from './features/thread/thread';
import { LoginComponent } from './features/login/login';
import { ComposeComponent } from './features/compose/compose';
import { SearchComponent } from './features/search/search';
import { NotificationsComponent } from './features/notifications/notifications';
import { SettingsComponent } from './features/settings/settings';

export const routes: Routes = [
  { path: 'login',   component: LoginComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home',          component: FeedComponent },
      { path: 'profile',       component: ProfileComponent },
      { path: 'compose', component: ComposeComponent },
      { path: 'search',        component: SearchComponent },
      { path: 'post/:id',      component: ThreadComponent },
      { path: 'settings',      component: SettingsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '',              redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];