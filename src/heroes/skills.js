export const skills = {
  autoDefense: {
      name: 'Auto Defense',
      description: 'Sofre menos dano do counterAttack (-1)',
      triggers: [],
      apply: (hero, target) => {
          if (hero.ability === 'Auto Defense') {
              console.log(`${hero.name} reduz o dano do contra-ataque!`);
              target.takeDamage(Math.max(0, target.attack - 1));
          }
      }
  },
  firstPunch: {
    name: 'First Punch',
    description: 'Primeiro ataque da partida causa mais dano (+2)',
    triggers: ['onTurnStart', 'onAttack'],
    apply: (hero, target = null) => {
        if (!hero.state.firstPunchApplied && hero.state.isAlive && !hero.state.hasPunched && target === null) {
            hero.increaseAttack(2);
            hero.state.firstPunchApplied = true;
            console.log(`${hero.name} prepara um soco poderoso! (+2 ataque)`);
            return;
        }

        if (target && !hero.state.hasPunched) {
            console.log(`${hero.name} usa seu First Punch causando dano adicional!`);
            hero.increaseAttack(-2);
            hero.state.hasPunched = true;
            return;
        } 
    }
},
  brokenDefense: {
    name: 'Broken Defense',
    description: 'Causa mais dano em inimigos com "Taunt". (+2)',
    triggers: [],
    apply: (hero, target) => {
        if (target.ability === 'Taunt') {
            const bonusDamage = 2;
            console.log(`${hero.name} causa dano extra a ${target.name} devido a "Broken Defense"!`);
            target.takeDamage(hero.attack + bonusDamage);
        } else {
            console.log(`${hero.name} ataca ${target.name} normalmente.`);
            target.takeDamage(hero.attack);
        }
    }
  },
  poisonAttack: {
      name: 'Poison Attack',
      description: 'Envenena o inimigo causando 1 de dano por turno.',
      triggers: [],
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
