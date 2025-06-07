import Hero from '../core/hero.js';
import { getHeroData } from '../utils/helpers.js';

export const HeroClasses = {};

export async function loadHeroClasses() {
  const heroesData = await getHeroData();

  heroesData.forEach(hero => {
    class CustomHero extends Hero {
      static data = hero;

      constructor(scene, x, y, socket) {
        super(
          scene,
          x,
          y,
          hero.frame,
          hero.name,
          hero.icon_attack,
          hero.stats.attack,
          hero.stats.hp,
          hero.stats.ability,
          hero.abilities.map(a => a.key),
          null,
          socket,
          hero.id
        );
      }

      takeDamage(amount, attacker = null, isCounterAttack = false) {
        if (hero.name === "Ralph" && isCounterAttack) {
          amount = Math.max(0, amount - 1);
        }
        super.takeDamage(amount, attacker);
      }
    }

    HeroClasses[hero.name] = CustomHero;
  });
}
