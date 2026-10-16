import gsap from 'gsap';
import confetti from 'canvas-confetti';

export const fireToscaConfetti = () => {
  // Palet tosca & mint lembut
  const colors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#fbbf24'];

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: colors,
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    disableForReducedMotion: true
  });
};

export const animateCardsIn = (selector: string = '.todo-card-item') => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  gsap.fromTo(
    elements,
    { opacity: 0, y: 18, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'transform'
    }
  );
};

export const animateTaskComplete = (element: HTMLElement, onDone?: () => void) => {
  gsap.timeline({ onComplete: onDone })
    .to(element, {
      scale: 1.02,
      duration: 0.12,
      ease: 'power1.out'
    })
    .to(element, {
      scale: 1,
      duration: 0.18,
      ease: 'back.out(2)'
    });
};

export const animateModalEnter = (modalEl: HTMLElement, backdropEl?: HTMLElement) => {
  if (backdropEl) {
    gsap.fromTo(
      backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );
  }

  gsap.fromTo(
    modalEl,
    { opacity: 0, scale: 0.92, y: 20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'back.out(1.5)',
      clearProps: 'transform'
    }
  );
};
