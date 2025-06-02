import { HeroClasses, loadHeroClasses } from './heroes.js';

let heroesLoaded = false;

export async function createHeroByName(name, scene, x, y, socket, state = null) {
  if (!heroesLoaded) {
    await loadHeroClasses();
    heroesLoaded = true;
  }

  const HeroClass = HeroClasses[name];
  if (!HeroClass) {
    throw new Error(`Herói não encontrado: ${name}`);
  }
  return new HeroClass(scene, x, y, socket, state);
}

export default HeroClasses;
