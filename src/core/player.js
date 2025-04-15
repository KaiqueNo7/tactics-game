export default class Player {
  constructor(name, heros = []) {
      this.id = crypto.randomUUID();
      this.name = name;
      this.heros = heros;
      this.number = 1;
  }

  setNumber(number){
    this.number = number;
  }

  addHeroes(heroes){
    heroes.forEach(hero => {
        hero.addPlayerId(this.id);
        this.heros.push(hero);
    });
  }

  toJSON() {
      return {
          id: this.id,
          name: this.name,
          heros: this.heros.map(char => char.toJSON())
      };
  }
}
