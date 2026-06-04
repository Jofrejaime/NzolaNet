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
import { AccountComponent } from './features/settings/account/account';
import { PrivacyComponent } from './features/settings/privacy/privacy';
import { SecurityComponent } from './features/settings/security/security';
import { HelpComponent } from './features/settings/help/help';
import { AboutComponent } from './features/settings/about/about';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';
import { AdminComponent } from './features/admin/admin';
import { FollowersComponent } from './features/profile/followers/followers';
import { FollowingComponent } from './features/profile/following/following';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: FeedComponent },
      { path: 'profile/followers', component: FollowersComponent },
      { path: 'profile/following', component: FollowingComponent },
      { path: 'profile/:id/followers', component: FollowersComponent },
      { path: 'profile/:id/following', component: FollowingComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
      { path: 'search', component: SearchComponent },
      { path: 'post/:id', component: ThreadComponent },
      { path: 'compose', component: ComposeComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'settings/account', component: AccountComponent },
      { path: 'settings/privacy', component: PrivacyComponent },
      { path: 'settings/security', component: SecurityComponent },
      { path: 'settings/help', component: HelpComponent },
      { path: 'settings/about', component: AboutComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  
  { path: '**', redirectTo: 'home' },
];
