# Alerta Guarani • Site de apresentação V3

## Navegação como slides

Site institucional independente da dashboard local. Possui **6 telas**: abertura, Itaipu, Projeto, Materiais, Funcionalidades, e rodapé com nome do grupo.

Em telas de notebook **1100×700, 1366×768 e 1440×900** cada seção ocupa **100svh** e não tem rolagem interna. Menu com rolagem suave, CSS Scroll Snap, GSAP e ScrollTrigger. Em celular o conteúdo flui naturalmente para garantir legibilidade.

## Iniciar

Execute `INICIAR_SITE.bat` no Windows ou `python -m http.server 5081` na pasta do site e acesse `http://127.0.0.1:5081`.

## Imagens reais

As fotografias documentais dos componentes e de Itaipu estão vinculadas a arquivos públicos do Wikimedia Commons, **não são imagens geradas por IA**. Por isso, precisam de internet. O CSS fornece uma alternativa textual quando imagens externas não carregarem. Acesse `CREDITOS_IMAGENS.md` para licenças e autores. São fotos de referência, **não do protótipo montado pelo grupo**. Quando houver fotos reais do protótipo, substitua os URLs nos elementos `<img>` do `index.html` pelas imagens próprias em `assets/`.

## Modelo 3D

O tanque é um **modelo geométrico real** desenhado em WebGL2 pelo arquivo `tank-webgl.js`, com alternativa geométrica 3D em CSS. Não é uma fotografia, nem leitura do Arduino. Ajuste a barra da seção Projeto para interagir com o nível ilustrativo.

## Personalização

**Nome do grupo:** no arquivo `main.js`, altere `const groupName='NOME DO GRUPO'` pelo nome verdadeiro. Não foram inventados nomes de integrantes.

**Dashboard:** `assets/dashboard-v26.png` é uma captura do sistema funcional, incluída para o site institucional; a página não acessa COM7, login técnico ou dados reais.

**GSAP:** usa CDN público; caso não carregue, a página e a navegação continuam funcionais sem efeitos adicionais.

## Verificações

Testadas as dimensões da caixa de cada seção e ausência de overflow horizontal em 1100×700, 1366×768, 1440×900 e 390×844 usando Chromium. A execução WebGL e o controle do nível virtual não geraram erros de script. O ambiente de verificação bloqueia downloads externos, portanto capturas locais de teste exibem áreas de imagem com fundo substituto. As fotos serão solicitadas ao Wikimedia Commons em um navegador com internet.
