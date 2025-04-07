export const skills = {
  autoDefense: {
      name: 'Auto Defense',
      description: 'Sofre menos dano do counterAttack (-1)',
      apply: (hero, target) => {
          if (hero.ability === 'Auto Defense') {
              console.log(`${hero.name} reduz o dano do contra-ataque!`);
              target.takeDamage(Math.max(0, target.attack - 1));
          }
      }
  },
  firstPunch: {
      name: 'First Punch',
      description: 'Primeiro ataque causa mais dano (+2)',
      apply: (hero, target) => {
          if (!hero.hasAttacked) {
              console.log(`${hero.name} desferiu o primeiro golpe com força extra!`);
              target.takeDamage(hero.attack + 2);
              hero.hasAttacked = true; // Marca que ele já atacou
          } else {
              target.takeDamage(hero.attack);
          }
      }
  },
  poisonAttack: {
      name: 'Poison Attack',
      description: 'Envenena o inimigo causando 1 de dano por turno.',
      apply: (hero, target) => {
          console.log(`${hero.name} envenena ${target.name}!`);
          target.applyStatusEffect({
              type: 'poison',
              duration: Infinity,
              effect: (target) => {
                  target.takeDamage(1);
                  console.log(`${target.name} recebe 1 de dano por veneno!`);
              }
          });
      }
  }
};
