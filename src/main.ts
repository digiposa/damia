import { Game } from './Game';

async function bootstrap(): Promise<void> {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Missing #app root element in index.html');
  }
  const game = new Game();
  await game.start(container);
}

bootstrap().catch((err) => {
  console.error('[Damia] Bootstrap failed:', err);
});
