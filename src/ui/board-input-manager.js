import { i18n } from "../../i18n";

export default class BoardInputManager {
  constructor(scene, board, socket) {
    this.scene = scene;
    this.board = board;
    this.socket = socket;

    this.selectedHero = null;
    this.highlightedHexes = [];
  }

  selectHero(hero) {
    if (!hero?.state?.isAlive) return;

    const isMyHero = hero.playerId === this.socket.id;
    const gameManager = this.scene.gameManager;
    const turnManager = gameManager.getTurnManager();
    const currentPlayer = turnManager.getCurrentPlayer();

    if (!isMyHero) return;

    if (this.selectedHero === hero) {
      this.deselectHero();
      return;
    }

    if (!currentPlayer.heroes.includes(hero)) {
      this.handleEnemyHeroSelection(hero, turnManager);
      return;
    }

    if (this.selectedHero) {
      this.selectedHero.setSelected(false);
    }

    this.selectAndHighlightHero(hero);
  }

  deselectHero() {
    if (this.selectedHero) {
      this.selectedHero.setSelected(false);
      this.selectedHero = null;
      this.clearHighlights();
    }
  }

  handleEnemyHeroSelection(targetHero, turnManager) {
    if (this.selectedHero?.attackTarget) {
      if (turnManager.currentTurn.attackedHeroes.has(this.selectedHero)) {
        this.scene.gameUI.showMessage(i18n.already_attacked);
      } else {
        this.board.attackHero(this.selectedHero, targetHero);
        turnManager.markHeroAsAttacked(this.selectedHero);
      }
      this.deselectHero();
    } else {
      this.scene.gameUI.showMessage(i18n.wait_your_turn);
    }
  }

  selectAndHighlightHero(hero) {
    this.selectedHero = hero;
    this.selectedHero.setSelected(true);
    this.clearHighlights();

    const moveRange = hero.ability === 'Sprint' ? 3 : 2;

    const movableHexes = this.board.getMovableHexes(hero, moveRange);
    const enemyHexes = this.board.getEnemiesInRange(hero, hero.attackRange);

    const uniqueHexes = [
      ...movableHexes.map(hex => ({ hex, type: 'move' })),
      ...enemyHexes.map(hex => ({ hex, type: 'enemy' }))
    ].filter((item, index, self) =>
      index === self.findIndex(h => h.hex.label === item.hex.label)
    );

    this.highlightedHexes = uniqueHexes;
    this.board.highlightHexes(this.highlightedHexes);
  }

  clearHighlights() {
    this.board.clearHighlights();
    this.highlightedHexes = [];
  }
}
