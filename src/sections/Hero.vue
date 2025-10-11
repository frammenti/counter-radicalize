<template>
  <section class='grid' aria-label='Hero'>
    <div>
      <h1 class='title'>
        <span>C</span>
        <span>o</span>
        <span class='breathe'>u</span>
        <span>n</span>
        <span class='breathe'>t</span>
        <span class='breathe'>e</span>
        <span class='breathe'>r</span>
        <strong>–</strong>
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
    <div>
      <p class='subtitle'>An experimental tool to analyze and visualize emotional content in speech.</p>
      <a class='button' id='cta' href='#about'>Dig deeper</a>
    </div>
  </section>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-areas: '. t s';
  grid-template-columns: 0.25fr 0.8fr 1.1fr;

  > :first-child {
    grid-area: t;
  }

  > :nth-child(2) {
    grid-area: s;
    text-align: center;
    margin: 2rem;
  }
}
.title {
  font-size: 4.5rem;
  font-weight: unset;
  font-feature-settings: 'kern' 0;
  font-variation-settings: 'wdth' 130, 'wght' 600;
  cursor: crosshair;
  line-height: 1.1;
  margin: 0;
  animation: disable 4.5s backwards;

  span {
    transition: font-variation-settings 700ms ease;

    &:hover,
    &:hover + span,
    &:has(+ span:hover) {
      font-variation-settings: 'wdth' 100, 'wght' 200;
    }
  }
}
.breathe {
  animation: letter-breathe 3s ease 1.5s;
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
#cta {
  padding-inline: 1.2em;
  padding-block: 0.6em;
  background-color: unset;
  border: 2px solid;
  transition: 
    --gradSize ease-in-out 370ms,
    color ease-in-out 150ms 100ms;
  background: radial-gradient(circle var(--gradSize) at 50% 110%, light(text) 49%, transparent 51%);
  @include theme(color, text);
  @include theme(border-color, text);
  @media (prefers-color-scheme: dark) {
    background: radial-gradient(circle var(--gradSize) at 50% 110%, dark(text) 49%, transparent 51%);
  }
  &:hover,
  &:active,
  &:focus-visible {
    --gradSize: 200px;
    @include theme(color, background);
  }
}
@media screen and (width < $laptop) {
  .grid {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    > :nth-child(2) {
      margin: 0;
    }
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
  #cta {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}
@media screen and (width < $tablet) {
  .title {
    font-size: 3.1rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
  #cta {
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
</style>
