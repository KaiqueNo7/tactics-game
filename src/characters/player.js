export default class Player {
  constructor(name, characters = []) {
      this.id = Date.now() + Math.random();
      this.name = name;
      this.characters = characters;
      this.strategy = 'default'; // Para futuras implementações de IA
  }

  // Adicionar um personagem ao jogador
  addCharacter(character) {
      this.characters.push(character);
  }

  // Remover um personagem do jogador
  removeCharacter(characterId) {
      this.characters = this.characters.filter(char => char.id !== characterId);
  }

  // Obter todos os personagens vivos do jogador
  getAliveCharacters() {
      return this.characters.filter(char => char.state.isAlive);
  }

  // Serializa o jogador para salvar o estado do jogo
  toJSON() {
      return {
          id: this.id,
          name: this.name,
          characters: this.characters.map(char => char.toJSON())
      };
  }
}
