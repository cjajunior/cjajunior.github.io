# cjajunior.github.io

Portfólio de Claudio Junior Alicati, desenvolvedor full stack: **https://cjajunior.github.io**

## Projetos em destaque

- [Atrium](https://atrium-client-portal.vercel.app/): portal de clientes para agências, com permissões por perfil feitas com Row Level Security no PostgreSQL ([código](https://github.com/cjajunior/atrium))
- [Leon Barber Shop](https://leon-barbearia.vercel.app/): site e agenda on-line de uma barbearia de Campo Limpo Paulista
- [ClientFlow](https://clientflow-pi-gray.vercel.app/): clientes, projetos, faturas e fluxo de caixa para quem presta serviço

## Como o site foi feito

Página estática em HTML, CSS e JavaScript, publicada pelo GitHub Pages, sem etapa de build.

- Animações: [GSAP](https://gsap.com) com ScrollTrigger e SplitText (`assets/vendor`)
- Rolagem suave: [Lenis](https://github.com/darkroomengineering/lenis), licença MIT
- Tipografia: [Mona Sans](https://github.com/github/mona-sans), fonte variável de largura e peso, sob a SIL Open Font License (`assets/fonts/OFL.txt`)

Quem prefere menos movimento (`prefers-reduced-motion`) vê a página sem animações e sem rolagem suave.

## Estrutura

```
index.html
assets/css/style.css
assets/js/main.js
assets/vendor/   GSAP, ScrollTrigger, SplitText e Lenis
assets/fonts/    Mona Sans e licença
assets/img/      telas dos projetos e favicon
og-image.png     imagem de compartilhamento
```
