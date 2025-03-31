export default class Player {
  constructor(name, characters = []) {
      this.id = Date.now() + Math.random();
      this.name = name;
      this.characters = characters;
      this.strategy = 'default'; // Para futuras implementações de IA
  }

  addCharacter(character) {
      this.characters.push(character);
  }

  removeCharacter(characterId) {
      this.characters = this.characters.filter(char => char.id !== characterId);
  }

  getAliveCharacters() {
      return this.characters.filter(char => char.state.isAlive);
  }

  toJSON() {
      return {
          id: this.id,
          name: this.name,
          characters: this.characters.map(char => char.toJSON())
      };
  }
}
