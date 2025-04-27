export default class Player {
  constructor(name, heroes = [], id, number) {
    this.id = id;
    this.name = name;
    this.heroes = heroes;
    this.number = number;
  }

  setNumber(number){
    this.number = number;
  }

  addHeroes(heroes){
    heroes.forEach(hero => {
      hero.addPlayerId(this.id);
      this.heroes.push(hero);
    });
  }

  getPlayerById(id) {
    return this.id === id ? this : null;
  }

  toJSON() {
    return {
      heroes: this.heroes.map(char => char.toJSON()),
      id: this.id,
      name: this.name,
      number: this.number
    };
  }
}
