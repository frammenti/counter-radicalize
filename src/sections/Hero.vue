<template>
  <section class='hero grid paginated' aria-label='Hero'>
    <div class='grid-item-1'>
      <h1 class='title'>
        <span>C</span>
        <span>o</span>
        <span class='breathe'>u</span>
        <span>n</span>
        <span class='breathe'>t</span>
        <span class='breathe'>e</span>
        <span class='breathe'>r</span>
        <strong> / </strong>
        <span>R</span>
        <span>a</span>
        <span>d</span>
        <span class='breathe'>i</span>
        <span class='breathe'>c</span>
        <span class='breathe'>a</span>
        <span class='breathe'>l</span>
        <span class='breathe'>i</span>
        <span class='breathe'>z</span>
        <span class='breathe'>e</span>
      </h1>
    </div>
    <div class='grid-item-2'>
      <p class='subtitle'>An experimental tool to analyze and visualize emotional content in speech.</p>
      <a class='button hero-button' href='#about'>Dig deeper</a>
    </div>
  </section>
</template>

<style scoped lang='scss'>
.hero {
  grid-template-areas: '. t s';
  grid-template-columns: 0.25fr 0.8fr 1.1fr;
}
.title {
  font-size: 4.5rem;
  font-feature-settings: 'kern' 0;
  font-variation-settings: 'wght' 600;
  cursor: crosshair;
  line-height: 1.1;
  margin: 0;
  animation: disable 4.5s backwards;
}
.grid-item-1 {
  grid-area: t;
}
.grid-item-2 {
  grid-area: s;
  text-align: center;
  margin: 2rem;
}
.subtitle {
  font-size: 1.2rem;
  text-wrap: balance;
  margin-block: 0 1.5rem;
}
@property --gradSize {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}
.hero-button {
  color: resp($text-color);
  background-color: unset;
  outline: 2px solid resp($text-color);
  background: radial-gradient(circle var(--gradSize) at 50% 110%, resp($text-color) 49%, transparent 51%);
  transition: 
    --gradSize ease-in-out 370ms,
    color ease-in-out 150ms 100ms;
}
.hero-button:hover, .hero-button:active {
  --gradSize: 200px;
  color: resp($background-color);

}
.title span {
  transition: font-variation-settings 1s ease;
}
.title span:hover,
.title span:hover + span,
.title span:has(+ span:hover) {
  font-variation-settings: 'wght' 300;
}
.breathe {
  animation: letter-breathe 3s ease 1.5s;
}
@media screen and (width < $laptop) {
  .hero {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
  }
  .title {
    font-size: 5.5rem;
    line-height: 1;
    text-align: center;
    margin-block: 0 2rem;
  }
  .subtitle {
    font-size: 1.5rem;
    margin-block: 0 2.5rem;
    margin-inline: 3.5rem;
  }
  .hero-button {
    font-size: 1.1rem;
    line-height: 1.6;
  }
  .grid-item-2 {
    margin: 0;
  }
}
@media screen and (width < $tablet) {
  .title {
    font-size: 3.1rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
  .hero-button {
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
</style>
