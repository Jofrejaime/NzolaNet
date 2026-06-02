import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="max-w-[600px] mx-auto">
      <!-- Profile Header -->
      <div class="bg-[var(--bg-surface)] rounded-lg mb-4 overflow-hidden">
        <!-- Cover Image -->
        <div class="h-[150px] bg-gradient-to-r from-[var(--bg-brand)] to-[var(--bg-brand-subtle)]"></div>
        
        <!-- Profile Info -->
        <div class="px-4 relative">
          <div class="flex justify-between items-end -mt-10 mb-4">
            <nzola-avatar 
              size="xl" 
              name="Sarah Jenkins"
              class="border-3 border-[var(--bg-surface)] rounded-full">
            </nzola-avatar>
            <button class="bg-[var(--bg-brand)] text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-[#C9460A] transition-all hover:-translate-y-0.5">
              Editar Perfil
            </button>
          </div>
          
          <div class="mb-4">
            <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-1">Sarah Jenkins</h1>
            <p class="text-sm text-[var(--text-secondary)] mb-3">@sarah_creates</p>
            <p class="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
              Digital designer & creative technologist. Exploring the interaction 
              of human connection and functional minimalism. Building in public.
            </p>
            
            <div class="flex gap-6 pt-3 border-t border-[var(--border-subtle)]">
              <div class="flex flex-col gap-1">
                <strong class="text-base font-bold text-[var(--text-primary)]">12.4K</strong>
                <span class="text-xs text-[var(--text-secondary)]">Followers</span>
              </div>
              <div class="flex flex-col gap-1">
                <strong class="text-base font-bold text-[var(--text-primary)]">842</strong>
                <span class="text-xs text-[var(--text-secondary)]">Posts</span>
              </div>
              <div class="flex flex-col gap-1">
                <strong class="text-base font-bold text-[var(--text-primary)]">4.2K</strong>
                <span class="text-xs text-[var(--text-secondary)]">Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tabs -->
      <div class="flex gap-1 border-b border-[var(--border-subtle)] mb-4">
        <button 
          class="px-4 py-3 bg-transparent border-none text-sm font-medium text-[var(--text-secondary)] cursor-pointer transition-all hover:text-[var(--text-primary)] hover:bg-[var(--state-hover)] relative"
          [class.text-[var(--text-brand)]]="activeTab === 'posts'"
          [class.after:content-['']]="activeTab === 'posts'"
          [class.after:absolute]="activeTab === 'posts'"
          [class.after:bottom-[-1px]]="activeTab === 'posts'"
          [class.after:left-0]="activeTab === 'posts'"
          [class.after:right-0]="activeTab === 'posts'"
          [class.after:h-[2px]]="activeTab === 'posts'"
          [class.after:bg-[var(--border-brand)]]="activeTab === 'posts'"
          (click)="activeTab = 'posts'">
          Posts
        </button>
        <button 
          class="px-4 py-3 bg-transparent border-none text-sm font-medium text-[var(--text-secondary)] cursor-pointer transition-all hover:text-[var(--text-primary)] hover:bg-[var(--state-hover)] relative"
          [class.text-[var(--text-brand)]]="activeTab === 'replies'"
          [class.after:content-['']]="activeTab === 'replies'"
          [class.after:absolute]="activeTab === 'replies'"
          [class.after:bottom-[-1px]]="activeTab === 'replies'"
          [class.after:left-0]="activeTab === 'replies'"
          [class.after:right-0]="activeTab === 'replies'"
          [class.after:h-[2px]]="activeTab === 'replies'"
          [class.after:bg-[var(--border-brand)]]="activeTab === 'replies'"
          (click)="activeTab = 'replies'">
          Respostas
        </button>
        <button 
          class="px-4 py-3 bg-transparent border-none text-sm font-medium text-[var(--text-secondary)] cursor-pointer transition-all hover:text-[var(--text-primary)] hover:bg-[var(--state-hover)] relative"
          [class.text-[var(--text-brand)]]="activeTab === 'highlights'"
          [class.after:content-['']]="activeTab === 'highlights'"
          [class.after:absolute]="activeTab === 'highlights'"
          [class.after:bottom-[-1px]]="activeTab === 'highlights'"
          [class.after:left-0]="activeTab === 'highlights'"
          [class.after:right-0]="activeTab === 'highlights'"
          [class.after:h-[2px]]="activeTab === 'highlights'"
          [class.after:bg-[var(--border-brand)]]="activeTab === 'highlights'"
          (click)="activeTab = 'highlights'">
          Destaques
        </button>
        <button 
          class="px-4 py-3 bg-transparent border-none text-sm font-medium text-[var(--text-secondary)] cursor-pointer transition-all hover:text-[var(--text-primary)] hover:bg-[var(--state-hover)] relative"
          [class.text-[var(--text-brand)]]="activeTab === 'media'"
          [class.after:content-['']]="activeTab === 'media'"
          [class.after:absolute]="activeTab === 'media'"
          [class.after:bottom-[-1px]]="activeTab === 'media'"
          [class.after:left-0]="activeTab === 'media'"
          [class.after:right-0]="activeTab === 'media'"
          [class.after:h-[2px]]="activeTab === 'media'"
          [class.after:bg-[var(--border-brand)]]="activeTab === 'media'"
          (click)="activeTab = 'media'">
          Mídia
        </button>
      </div>

      <!-- Posts Grid -->
      <div class="flex flex-col gap-4">
        <!-- Post 1 -->
        <div class="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4 transition-all hover:bg-[var(--state-hover)] hover:-translate-y-0.5">
          <div class="flex gap-3 mb-3">
            <nzola-avatar size="md" name="Sarah Jenkins"></nzola-avatar>
            <div class="flex-1">
              <div class="flex items-center gap-1 flex-wrap">
                <span class="font-semibold text-[var(--text-primary)] text-sm">Sarah Jenkins</span>
                <span class="text-xs text-[var(--text-secondary)]">@sarah_creates</span>
                <span class="text-xs text-[var(--text-tertiary)]">·</span>
                <span class="text-xs text-[var(--text-secondary)]">2h</span>
              </div>
            </div>
          </div>
          
          <div class="mb-3 text-[var(--text-primary)] text-sm leading-relaxed">
            Just wrapped up a new case study on functional glassmorphism. It's fascinating 
            how a simple 12px blur can establish such strong hierarchy without muddying 
            the interface with heavy shadows. Details dropping tomorrow! ✨
          </div>
          
          <div class="flex gap-4 py-3 border-t border-b border-[var(--border-subtle)] mb-3 text-xs text-[var(--text-secondary)]">
            <span>📍 24</span>
            <span>💬 12</span>
            <span>🔄 3</span>
          </div>
          
          <div class="flex gap-4">
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all hover:text-[#E8550F]">🔥 Bazar</button>
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all">💬 Comentar</button>
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all">↗️ Partilhar</button>
          </div>
        </div>

        <!-- Post 2 -->
        <div class="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4 transition-all hover:bg-[var(--state-hover)] hover:-translate-y-0.5">
          <div class="flex gap-3 mb-3">
            <nzola-avatar size="md" name="Sarah Jenkins"></nzola-avatar>
            <div class="flex-1">
              <div class="flex items-center gap-1 flex-wrap">
                <span class="font-semibold text-[var(--text-primary)] text-sm">Sarah Jenkins</span>
                <span class="text-xs text-[var(--text-secondary)]">@sarah_creates</span>
                <span class="text-xs text-[var(--text-tertiary)]">·</span>
                <span class="text-xs text-[var(--text-secondary)]">5h</span>
              </div>
            </div>
          </div>
          
          <div class="mb-3 text-[var(--text-primary)] text-sm leading-relaxed">
            Current workspace vibe. The depth you get from laying sunken and elevated surfaces is so satisfying.
          </div>
          
          <!-- Placeholder de imagem -->
          <div class="mb-3 h-[240px] bg-gradient-to-r from-[var(--bg-overlay)] to-[var(--bg-elevated)] rounded-md"></div>
          
          <div class="flex gap-4 py-3 border-t border-b border-[var(--border-subtle)] mb-3 text-xs text-[var(--text-secondary)]">
            <span>📍 45</span>
            <span>💬 28</span>
            <span>🔄 7</span>
          </div>
          
          <div class="flex gap-4">
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all hover:text-[#E8550F]">🔥 Bazar</button>
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all">💬 Comentar</button>
            <button class="bg-transparent border-none text-[var(--text-secondary)] text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)] transition-all">↗️ Partilhar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';
}