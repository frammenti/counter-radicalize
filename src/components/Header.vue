<template>
  <header class='grid'>
    <div class='logo grid-item-1'>
      <a href='/'>Con/rad</a>
    </div>
    <nav id='site-nav' class='grid grid-item-2'>
      <ul>
        <li><a href='#about'>About</a></li>
        <li><a href='#transcript'>Read/Listen/See</a></li>
        <li><a href='#linguistic-features'>Linguistic features</a></li>
      </ul>
    </nav>
    <div class='grid-item-3'>
      <a href='https://github.com/frammenti/counter-radicalize' target='_blank'>
        <svg viewBox='0 0 24 24' aria-hidden='true'><path fill-rule='evenodd' clip-rule='evenodd' d='M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z'></path></svg>
        <span>frammenti/counter-radicalize</span>
      </a>
    </div>
  </header>
</template>

<style scoped lang='scss'>
@use '../assets/styles/palette' as *;
header {
  grid-template-columns: 1fr 2.5fr 1fr;
  line-height: 1.4;
  padding-inline: 1.2rem;
  padding-block: 0.5rem;
}
.logo {
  font-family: $title-font-family;
  font-size: 1.8rem;
  line-height: 1;
  letter-spacing: -1px;
}
header a {
  color: resp($text-color);
  font-weight: 600;
}
ul {
  display: contents;
  list-style: none;
}
li {
  display: block;
  text-align: center;
}
@media screen and (max-width: 1280px) {
  header {
    grid-template-columns: 1fr 3fr 1fr;
  }
  a span {
    display: none;
  }
  a svg {
    height: 2rem;
    width: 2rem;
  }
}
@media screen and (max-width: 768px) {
  header {
    grid-template-columns: 1fr 1fr;
    padding-inline: 0.5rem;
  }
  nav {
    display: none;
  }
}
</style>
