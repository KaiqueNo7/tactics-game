import { i18n } from "../../i18n";

export default function createHeroDetailUI(scene, withConfirmButton = false) {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2 - 50;

  const elements = {};

  // Cria container principal invisível
  elements.container = scene.add.container(0, 0).setVisible(false).setDepth(99);

  elements.previewSprite = scene.add.sprite(40, centerY + 10, 'heroes', 0)
    .setScale(0.4)
    .setOrigin(0.5);

  elements.heroNameText = scene.add.text(centerX, centerY - 75, '', {
    fontSize: '32px',
    color: '#FFF',
    fontFamily: 'Fredoka',
    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
  }).setOrigin(0.5, 1);

  elements.heroStatsText = scene.add.text(centerX - 70, centerY - 60, '', {
    color: '#FFF',
    fontSize: '16px',
    fontFamily: 'Fredoka',
  }).setOrigin(0, 0);

  elements.heroAbilitiesText = scene.add.text(centerX - 70, centerY - 35, '', {
    color: '#FFF',
    fontSize: '16px',
    fontFamily: 'Fredoka',
  }).setOrigin(0, 0);

  elements.heroSkillsText = scene.add.text(centerX - 70, centerY - 10, '', {
    fontSize: '16px',
    fontFamily: 'Fredoka',
    wordWrap: { width: 220 }
  }).setOrigin(0, 0);

  elements.container.add([
    elements.previewSprite,
    elements.heroNameText,
    elements.heroStatsText,
    elements.heroAbilitiesText,
    elements.heroSkillsText
  ]);

  if (withConfirmButton) {
    elements.confirmButton = scene.add.text(centerX - 50, centerY + 100, i18n.select, {
      backgroundColor: '#1E3888',
      color: '#fff8dc',
      fontSize: '16px',
      fontFamily: 'Fredoka',
      padding: { x: 12, y: 6 },
      align: 'center'
    }).setOrigin(0).setInteractive();

    elements.confirmButton.on('pointerdown', () => {
      if (scene.previewedHero) {
        scene.confirmSelection(scene.previewedHero);
        scene.hideHeroDetail();
      }
    });

    elements.container.add(elements.confirmButton);
  }

  elements.show = (hero) => {
    const abilities = hero.skills || hero.abilities || [];
    const hp = hero.stats.maxHealth || hero.stats.hp;
    const frame = hero.frameIndex || hero.frame;
    const ability = hero.ability || hero.stats.ability || '-';

    const abilitiesFormatted = abilities.length
      ? abilities.map(a => i18n[a.description] || a.description).join('\n')
      : 'No skills';

    console.log(hero);

    elements.previewSprite.setTexture('heroes', frame);
    elements.heroNameText.setText(hero.name);
    elements.heroStatsText.setText(`attack: ${hero.stats.attack} hp: ${hp}`);
    elements.heroAbilitiesText.setText(ability);
    elements.heroSkillsText.setText(abilitiesFormatted);

    elements.container.setVisible(true);
  };

  elements.hide = () => {
    elements.container.setVisible(false);
  };

  return elements;
}
