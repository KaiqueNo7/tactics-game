import { Mineiro, Vic, Dante, Ralph, Ceos, Blade, Noctin, Elaria, Bramm } from '../heroes/heroes.js';

const HERO_CLASSES = {
  Mineiro,
  Vic,
  Dante,
  Ralph,
  Ceos,
  Blade,
  Noctin,
  Elaria,
  Bramm,
};

export function createHeroByName(name, scene, x, y, socket, state = null) {
  const HeroClass = HERO_CLASSES[name];
  if (!HeroClass) {
    throw new Error(`Herói não encontrado: ${name}`);
  }
  return new HeroClass(scene, x, y, socket, state);
}

export default HERO_CLASSES;