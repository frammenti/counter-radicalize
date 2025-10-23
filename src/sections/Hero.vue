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
        <strong>–</strong><br />
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
  grid-template-columns: 100%;
  grid-template-rows: auto auto;
  align-content: center;
  text-align: center;

  > :first-child {
    justify-self: center;
  }
}
.title {
  font-size: 3.1rem;
  margin-block-start: 0;
  line-height: 1;
  font-feature-settings: 'kern' 0;
  font-variation-settings: 'wdth' 130, 'wght' 600;
  cursor: default;
  animation: disable 4.5s backwards;

  @media (pointer: coarse) { user-select: none; }

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
  font-size: $fs-m;
  margin-block-start: 0;
  margin-block-end: $space-xl;
  margin-inline: $space-xl;
  text-wrap: balance;
}
@property --gradSize {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}
#cta {
  font-size: $fs-base;
  padding-inline: 1.2em;
  padding-block: 0.6em;
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

@media screen and (width >= $tablet) {
  .title {
    font-size: $fs-gigantic;
    margin-block-end: $space-l;
  }
  .subtitle {
    font-size: $fs-3xl;
  }
  #cta {
    font-size: $fs-l;
  }
}

@media screen and (width >= $laptop) {
  .grid {
    padding-inline-start: 12cqi;
    grid-template-columns: 0.7fr 1fr;
    grid-template-rows: 100%;

    > :first-child {
      justify-self: start;
      text-align: start;
    }

    > :nth-child(2) {
      margin: $space-xl;
    }
  }
  .title {
    font-size: $fs-enormous;
    line-height: 1.1;
    margin-block-end: 0;
  }
  .subtitle {
    font-size: $fs-xl;
    margin-block-end: 1.5rem;
  }
  #cta {
    font-size: $fs-base;
  }
}
</style>
