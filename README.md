# 🎲 Jogo de Tabuleiro 2D - Batalha de Turnos

## 📝 Descrição do Jogo

Este é um jogo de tabuleiro 2D em um grid hexagonal, onde dois jogadores competem em uma batalha estratégica de turnos. O objetivo principal é eliminar os personagens do oponente.

## 🏆 Regras Básicas

### Objetivo
- [ ] Cada jogador começa com 3 personagens
- [ ] O primeiro jogador a perder todos os seus 3 personagens perde o jogo
- [ ] O último jogador com personagens vivos é o vencedor

### Mecânica de Movimento
- [x] Os personagens podem se mover até 2 hexágonos por turno
- [x] Não é possível ocupar um hexágono já ocupado por outro personagem
- [x] O movimento respeita a geometria do tabuleiro hexagonal offset

### Tabuleiro
- [x] Tabuleiro hexagonal com 5 colunas (A, B, C, D, E)
- [x] Colunas alternadas com 6 e 7 hexágonos
- [x] Cada hexágono possui um identificador único (ex: A1, B2)

## 🚧 Próximos Passos de Desenvolvimento
- [ ] Implementar sistema de combate
- [ ] Adicionar turno alternado entre jogadores
- [ ] Criar lógica de eliminação de personagens
- [ ] Desenvolver interface para mostrar status dos jogadores

## 💻 Tecnologias Utilizadas
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas-2D-brightgreen?style=for-the-badge)

## 🎮 Como Jogar
1. Abra o arquivo `index.html` em um navegador
2. Clique em um personagem para selecioná-lo
3. Clique em um hexágono válido para mover o personagem

## 📦 Como Executar
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/jogo-tabuleiro-2d.git

# Navegue até o diretório
cd jogo-tabuleiro-2d

# Abra o index.html no seu navegador
```

## 📄 Licença
[MIT License](LICENSE)