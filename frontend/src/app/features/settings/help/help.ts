import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'nzola-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.html',
  styleUrls: ['./help.scss']
})
export class HelpComponent {
  faqs: FaqItem[] = [
    {
      question: 'Como criar uma publicação?',
      answer: 'Clica no botão "Nova Publicação" na sidebar ou no botão "+" no mobile. Escreve o teu conteúdo, adiciona imagens se quiseres e clica em "Publicar".',
      open: false
    },
    {
      question: 'O que é o "Baze"?',
      answer: 'O Baze é a nossa reacção positiva! É como um "like" que podes dar nas publicações que gostas. Cada publicação mostra quantos Bazes recebeu.',
      open: false
    },
    {
      question: 'Como sigo outros utilizadores?',
      answer: 'Visita o perfil de qualquer utilizador e clica no botão "Seguir". As publicações deles vão aparecer no teu feed principal.',
      open: false
    },
    {
      question: 'Como altero a minha foto de perfil?',
      answer: 'Vai a Configurações > Conta e clica na foto de perfil para fazer upload de uma nova imagem.',
      open: false
    },
    {
      question: 'O que é o modo escuro?',
      answer: 'O modo escuro reduz o cansaço visual em ambientes com pouca luz. Podes activar/desactivar em Configurações > Preferências > Tema escuro.',
      open: false
    }
  ];

  constructor(private router: Router) {}

  toggleFaq(faq: FaqItem): void {
    faq.open = !faq.open;
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  contactSupport(): void {
    window.location.href = 'mailto:suporte@nzolanet.com';
  }
}